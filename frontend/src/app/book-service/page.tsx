'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import LocationSharing from '@/components/LocationSharing'
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
  FaEnvelope
} from 'react-icons/fa'

// Fixed Service Pricing (no hourly rates)
const SERVICE_PRICING: Record<string, number> = {
  'cleaning': 1800,
  'electrical': 2000,
  'plumbing': 2000,
  'painting': 2500,
  'movers': 3000,
  'carpentry': 2000, // Adding carpentry with default rate
  'gardening': 1500   // Adding gardening with default rate
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
    serviceAreas: ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']
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
}

const serviceAreas = ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']

// Helper function to get fixed service price
const getServicePrice = (categoryId: string): number => {
  return SERVICE_PRICING[categoryId] || 2000 // Default to 2000 if not found
}

// Helper function to format service price display
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
    budget: { min: 1000, max: 5000 }
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

      // Try the intelligent matching first
      let response = await fetch(`${BACKEND_URL}/api/booking/match-providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      })

      let data = await response.json()
      console.log('Provider matching API response:', data)
      
      if (data.success && data.data.providers?.length > 0) {
        setProviderMatching({
          loading: false,
          providers: data.data.providers || [],
          error: null,
          totalFound: data.data.matching?.totalFound || 0
        })
        console.log('Found providers through matching:', data.data.providers?.length || 0)
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
          
          // Filter providers by skills client-side
          const matchingProviders = testData.data.providers.filter((provider: any) => {
            const providerSkills = provider.providerProfile?.skills || provider.skills || []
            const hasMatchingSkill = providerSkills.some((skill: string) => 
              skill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
              requiredSkill.toLowerCase().includes(skill.toLowerCase())
            )
            
            console.log(`Provider ${provider.name}:`, {
              skills: providerSkills,
              requiredSkill,
              hasMatchingSkill,
              providerStatus: provider.providerStatus
            })
            
            return hasMatchingSkill && provider.providerStatus === 'approved'
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
        if (bookingData.duration < 1) newErrors.duration = 'Duration must be at least 1 hour'
        if (!bookingData.description.trim()) newErrors.description = 'Please describe what you need'
        break
      case 'location':
        if (!bookingData.location.address.trim()) newErrors.address = 'Please enter your address'
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">What service do you need?</h2>
                  <p className="text-gray-600">Select the category that best matches your requirements</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <FaStar className="h-3 w-3 text-yellow-400 mr-1" />
                          <span>{category.rating}</span>
                        </div>
                        <span>{category.averagePrice}</span>
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
                      <h3 className="text-lg font-semibold text-gray-900">{bookingData.category.name}</h3>
                      <p className="text-gray-600">{bookingData.category.detailedDescription}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Date and Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaCalendarAlt className="inline h-4 w-4 mr-2" />
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaClock className="inline h-4 w-4 mr-2" />
                          Preferred Time
                        </label>
                        <select
                          value={bookingData.time}
                          onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select time</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="12:00">12:00 PM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                        {errors.time && <div className="text-red-500 text-sm mt-1">{errors.time}</div>}
                      </div>
                    </div>

                    {/* Providers Needed and Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUsers className="inline h-4 w-4 mr-2" />
                          Number of Providers
                        </label>
                        <select
                          value={bookingData.providersNeeded}
                          onChange={(e) => setBookingData(prev => ({ ...prev, providersNeeded: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value={1}>1 Provider</option>
                          <option value={2}>2 Providers</option>
                          <option value={3}>3 Providers</option>
                          <option value={4}>4+ Providers</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaClock className="inline h-4 w-4 mr-2" />
                          Expected Duration (hours)
                        </label>
                        <input
                          type="number"
                          value={bookingData.duration}
                          onChange={(e) => setBookingData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                          min="1"
                          max="12"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {errors.duration && <div className="text-red-500 text-sm mt-1">{errors.duration}</div>}
                      </div>
                    </div>

                    {/* Service Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Description
                      </label>
                      <textarea
                        value={bookingData.description}
                        onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what you need done..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'normal', label: 'Normal', desc: 'Within 24-48 hours', color: 'bg-green-50 border-green-200 text-green-700' },
                          { value: 'urgent', label: 'Urgent', desc: 'Within 2-6 hours', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                          { value: 'emergency', label: 'Emergency', desc: 'Within 1 hour', color: 'bg-red-50 border-red-200 text-red-700' }
                        ].map((urgency) => (
                          <button
                            key={urgency.value}
                            onClick={() => setBookingData(prev => ({ ...prev, urgency: urgency.value as any }))}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              bookingData.urgency === urgency.value
                                ? urgency.color
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{urgency.label}</div>
                            <div className="text-xs">{urgency.desc}</div>
                          </button>
                        ))}
                      </div>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Location</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Forms */}
                    <div className="space-y-6">
                      {/* Quick Location Options */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          <FaMapMarkerAlt className="inline h-4 w-4 mr-2" />
                          Quick Location
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            onClick={() => handleGetCurrentLocation()}
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <FaMapMarkerAlt className="h-4 w-4 mr-2 text-blue-600" />
                            Use Current Location
                          </button>
                          <button
                            onClick={() => handleSearchAddress()}
                            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                          >
                            <FaSearch className="h-4 w-4 mr-2 text-green-600" />
                            Enter Address
                          </button>
                        </div>
                      </div>

                      {/* Search Location (simplified) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search Address (Manual Entry)
                        </label>
                        <div className="relative">
                          <input
                            ref={addressSearchRef}
                            type="text"
                            placeholder="Type your address here..."
                            value={bookingData.location.address}
                            onChange={(e) => setBookingData(prev => ({ 
                              ...prev, 
                              location: { ...prev.location, address: e.target.value } 
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <FaSearch className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Google Maps autocomplete will be available in the future
                        </p>
                      </div>

                      {/* Service Area */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Area
                        </label>
                        <select
                          value={bookingData.location.area}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, area: e.target.value } 
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select your area</option>
                          {serviceAreas.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                        {errors.area && <div className="text-red-500 text-sm mt-1">{errors.area}</div>}
                      </div>

                      {/* Address Details */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complete Address
                        </label>
                        <textarea
                          value={bookingData.location.address}
                          onChange={(e) => setBookingData(prev => ({ 
                            ...prev, 
                            location: { ...prev.location, address: e.target.value } 
                          }))}
                          placeholder="Building name, apartment number, landmarks, etc."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Providers</h3>
                  
                  {providerMatching.loading ? (
                    <div className="text-center py-12">
                      <FaSpinner className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-spin" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Finding Providers...</h4>
                      <p className="text-gray-600">
                        Searching for {bookingData.providersNeeded} {bookingData.category?.name.toLowerCase()} provider(s) 
                        in {bookingData.location.area} for {bookingData.date} at {bookingData.time}
                      </p>
                    </div>
                  ) : providerMatching.error ? (
                    <div className="text-center py-12">
                      <FaExclamationTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Providers Found</h4>
                      <p className="text-gray-600 mb-4">{providerMatching.error}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <p>Try adjusting your criteria:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Choose a different time slot</li>
                          <li>Consider nearby service areas</li>
                          <li>Adjust your budget range</li>
                          <li>Book for a later date</li>
                        </ul>
                      </div>
                      <button
                        onClick={() => setCurrentStep('location')}
                        className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Modify Search Criteria
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
                                    {formatServicePrice(bookingData.category?.id || 'electrical')}
                                  </div>
                                  <div className="text-sm text-gray-500 mb-3">
                                    Fixed rate per service
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
                        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Selected Providers ({selectedProviders.length}/{bookingData.providersNeeded})
                          </h4>
                          <div className="space-y-2">
                            {selectedProviders.map((provider: any) => (
                              <div key={provider._id} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{provider.name}</span>
                                <span className="text-orange-600">
                                  {formatServicePrice(bookingData.category?.id || 'electrical')}
                                </span>
                              </div>
                            ))}
                            <div className="pt-2 border-t border-orange-200">
                              <div className="flex items-center justify-between font-semibold">
                                <span>Total Estimated Cost:</span>
                                <span className="text-lg text-orange-600">
                                  KES {(selectedProviders.length * getServicePrice(bookingData.category?.id || 'electrical')).toLocaleString()}
                                </span>
                              </div>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Summary</h3>
                    
                    <div className="space-y-4">
                      {/* Service Details */}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service:</span>
                        <span className="font-medium">{bookingData.category?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date & Time:</span>
                        <span className="font-medium">{bookingData.date} at {bookingData.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{bookingData.duration} hour(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{bookingData.location.area}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Urgency:</span>
                        <span className={`font-medium capitalize ${
                          bookingData.urgency === 'emergency' ? 'text-red-600' :
                          bookingData.urgency === 'urgent' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {bookingData.urgency}
                        </span>
                      </div>

                      {/* Selected Providers */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Selected Providers:</h4>
                        <div className="space-y-2">
                          {selectedProviders.map((provider: any) => (
                            <div key={provider._id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                                  {provider.profilePicture ? (
                                    <img src={provider.profilePicture} alt={provider.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-100">
                                      <FaUser className="h-3 w-3 text-orange-600" />
                                    </div>
                                  )}
                                </div>
                                <span className="font-medium">{provider.name}</span>
                              </div>
                              <span className="text-orange-600 font-medium">
                                {formatServicePrice(bookingData.category?.id || 'electrical')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Cost */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Cost:</span>
                          <span className="text-orange-600">
                            KES {(selectedProviders.length * getServicePrice(bookingData.category?.id || 'electrical')).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Payment will be held in escrow until service completion
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h3>
                    
                    <div className="text-center py-8">
                      <FaDollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Secure Escrow Payment</h4>
                      <p className="text-gray-600 mb-4">
                        Payment integration with M-Pesa and card payments will be implemented here.
                        Your payment will be held securely until service completion.
                      </p>
                      
                      <div className="space-y-3 max-w-sm mx-auto">
                        <button className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                          Pay with M-Pesa
                        </button>
                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Pay with Card
                        </button>
                        <button className="w-full py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors">
                          Pay on Service Completion
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Confirmation */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <input type="checkbox" className="mt-1" />
                      <div className="text-sm text-gray-600">
                        <p>By confirming this booking, you agree to our Terms of Service and Privacy Policy. 
                        Your location will be shared with selected providers to facilitate service delivery.</p>
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
                      onClick={() => {
                        // Handle booking confirmation
                        console.log('Confirming booking...', {
                          bookingData,
                          selectedProviders,
                          location: locationSharing.location
                        })
                      }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <FaCheck className="inline h-4 w-4 mr-2" />
                      Confirm Booking
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