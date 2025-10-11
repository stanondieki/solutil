'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import RoleGuard from '@/components/RoleGuard'
import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaWrench,
  FaLightbulb,
  FaBroom,
  FaHammer,
  FaCheck,
  FaDollarSign,
  FaStar,
  FaPhone,
  FaUser
} from 'react-icons/fa'

// TypeScript declarations for Paystack
declare global {
  interface Window {
    PaystackPop: PaystackPopup
  }
}

interface PaystackPopup {
  setup: (options: PaystackOptions) => {
    openIframe: () => void
  }
}

interface PaystackOptions {
  key: string
  email: string
  amount: number
  currency: string
  callback: (response: any) => void
  onClose: () => void
  metadata?: any
  channels?: string[]
}

// Service Categories
interface ServiceCategory {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  basePrice: number
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'plumbing',
    name: 'Plumbing Services',
    icon: FaWrench,
    description: 'Repairs, installations, emergency fixes',
    basePrice: 1500
  },
  {
    id: 'electrical',
    name: 'Electrical Work',
    icon: FaLightbulb,
    description: 'Wiring, fixtures, electrical repairs',
    basePrice: 2000
  },
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    icon: FaBroom,
    description: 'House cleaning, deep cleaning, maintenance',
    basePrice: 1200
  },
  {
    id: 'carpentry',
    name: 'Carpentry & Repairs',
    icon: FaHammer,
    description: 'Furniture assembly, repairs, custom work',
    basePrice: 1800
  }
]

const serviceAreas = ['Kileleshwa', 'Westlands', 'Kilimani', 'Parklands', 'Nyayo']

// Booking Data Interface
interface BookingData {
  category: ServiceCategory | null
  date: string
  time: string
  location: {
    address: string
    area: string
  }
  description: string
  urgency: 'normal' | 'urgent' | 'emergency'
  providersNeeded: number
  paymentTiming: 'pay-now' | 'pay-after' | null
  paymentMethod: 'card' | 'mobile-money' | null
  selectedProvider: any | null
}

function SimpleBookServiceContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [bookingData, setBookingData] = useState<BookingData>({
    category: null,
    date: '',
    time: '',
    location: { address: '', area: '' },
    description: '',
    urgency: 'normal',
    providersNeeded: 1,
    paymentTiming: null,
    paymentMethod: null,
    selectedProvider: null
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableProviders, setAvailableProviders] = useState<any[]>([])
  const [showProviders, setShowProviders] = useState(false)

  // Auto-load category from URL
  useEffect(() => {
    const categoryId = searchParams?.get('category')
    if (categoryId) {
      const category = serviceCategories.find(cat => cat.id === categoryId)
      if (category) {
        setBookingData(prev => ({ ...prev, category }))
      }
    }
  }, [searchParams])

  // Mock providers for demo
  const mockProviders = [
    {
      id: '1',
      name: 'John Doe',
      rating: 4.8,
      reviews: 156,
      phone: '+254701234567',
      experience: '5 years',
      specialties: ['Emergency repairs', 'Installations']
    },
    {
      id: '2', 
      name: 'Mary Wanjiku',
      rating: 4.9,
      reviews: 203,
      phone: '+254702345678',
      experience: '7 years',
      specialties: ['Residential', 'Commercial']
    }
  ]

  const calculatePrice = () => {
    if (!bookingData.category) return 0
    let price = bookingData.category.basePrice
    if (bookingData.urgency === 'urgent') price *= 1.5
    if (bookingData.urgency === 'emergency') price *= 2
    return Math.round(price)
  }

  const handleServiceSelect = (category: ServiceCategory) => {
    setBookingData(prev => ({ ...prev, category }))
    setShowProviders(false)
  }

  const searchProviders = () => {
    if (!bookingData.category || !bookingData.location.area) {
      setErrors({ general: 'Please select service and location first' })
      return
    }
    setAvailableProviders(mockProviders)
    setShowProviders(true)
  }

  const handleProviderSelect = (provider: any) => {
    setBookingData(prev => ({ ...prev, selectedProvider: provider }))
  }

  // Payment Functions
  const initializePaystack = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop)
        return
      }
      
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.onload = () => {
        if (window.PaystackPop) {
          resolve(window.PaystackPop)
        } else {
          reject(new Error('Paystack failed to load'))
        }
      }
      script.onerror = () => reject(new Error('Failed to load Paystack script'))
      document.head.appendChild(script)
    })
  }

  const handlePaystackPayment = async () => {
    try {
      setLoading(true)
      const PaystackPop = await initializePaystack() as PaystackPopup
      const amount = calculatePrice() * 100

      const paymentData: PaystackOptions = {
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_954e0aa0aad2caffbe6b31bd55eb48f8e2e45a55',
        email: user?.email || '',
        amount: amount,
        currency: 'KES',
        callback: (response: any) => {
          console.log('Payment successful:', response)
          handleBookingConfirmation(response.reference)
        },
        onClose: () => {
          console.log('Payment cancelled')
          setLoading(false)
        },
        metadata: {
          bookingId: Date.now().toString(),
          category: bookingData.category?.name,
          paymentTiming: bookingData.paymentTiming
        }
      }

      if (bookingData.paymentMethod === 'mobile-money') {
        paymentData.channels = ['mobile_money']
      }

      const handler = PaystackPop.setup(paymentData)
      handler.openIframe()
    } catch (error) {
      console.error('Payment failed:', error)
      setLoading(false)
    }
  }

  const handleBookingConfirmation = async (paymentReference?: string) => {
    try {
      setLoading(true)
      
      const bookingPayload = {
        ...bookingData,
        paymentReference,
        totalAmount: calculatePrice(),
        status: bookingData.paymentTiming === 'pay-now' ? 'confirmed' : 'pending_payment',
        createdAt: new Date().toISOString()
      }

      console.log('🎉 Booking confirmed:', bookingPayload)
      
      // Here you would make the API call to your backend
      alert(`Booking confirmed! ${bookingData.paymentTiming === 'pay-now' ? 'Payment processed.' : 'Payment link will be sent when service is completed.'}`)
      
    } catch (error) {
      console.error('Booking failed:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validateBooking = () => {
    const newErrors: Record<string, string> = {}
    
    if (!bookingData.category) newErrors.category = 'Please select a service'
    if (!bookingData.date) newErrors.date = 'Please select a date'
    if (!bookingData.time) newErrors.time = 'Please select a time'
    if (!bookingData.location.area) newErrors.area = 'Please select your area'
    if (!bookingData.selectedProvider) newErrors.provider = 'Please select a provider'
    if (!bookingData.paymentTiming) newErrors.paymentTiming = 'Please select payment timing'
    if (!bookingData.paymentMethod) newErrors.paymentMethod = 'Please select payment method'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFinalBooking = () => {
    if (!validateBooking()) return
    
    if (bookingData.paymentTiming === 'pay-now') {
      handlePaystackPayment()
    } else {
      handleBookingConfirmation()
    }
  }

  return (
    <RoleGuard allowedRoles={['user']}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              📋 Book Your Service
            </h1>
            <p className="text-xl text-gray-600">Simple, fast, and reliable service booking</p>
          </div>

          {/* Single Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            
            {/* Step 1: Service Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                🛠️ What service do you need?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceCategories.map((category) => {
                  const Icon = category.icon
                  const isSelected = bookingData.category?.id === category.id
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleServiceSelect(category)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <Icon className={`h-8 w-8 ${isSelected ? 'text-orange-600' : 'text-gray-600'}`} />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                          <div className="text-lg font-bold text-orange-600">
                            From KES {category.basePrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.category && <p className="text-red-600">{errors.category}</p>}
            </div>

            {/* Step 2: Service Details (Show when service selected) */}
            {bookingData.category && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 border-t pt-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  📅 When and where do you need it?
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date & Time */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📅 Select Date
                      </label>
                      <input
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      {errors.date && <p className="text-red-600 text-sm">{errors.date}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🕐 Select Time
                      </label>
                      <select
                        value={bookingData.time}
                        onChange={(e) => setBookingData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Choose time</option>
                        <option value="08:00">8:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                      </select>
                      {errors.time && <p className="text-red-600 text-sm">{errors.time}</p>}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📍 Your Area
                      </label>
                      <select
                        value={bookingData.location.area}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, area: e.target.value }
                        }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select your area</option>
                        {serviceAreas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                      {errors.area && <p className="text-red-600 text-sm">{errors.area}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🏠 Specific Address
                      </label>
                      <input
                        type="text"
                        value={bookingData.location.address}
                        onChange={(e) => setBookingData(prev => ({ 
                          ...prev, 
                          location: { ...prev.location, address: e.target.value }
                        }))}
                        placeholder="Building name, street, landmarks..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📝 Describe the work needed
                    </label>
                    <textarea
                      value={bookingData.description}
                      onChange={(e) => setBookingData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell us what needs to be done..."
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ⚡ Urgency Level
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'normal', label: '📅 Normal (1x price)', color: 'green' },
                        { value: 'urgent', label: '⚡ Urgent (1.5x price)', color: 'yellow' },
                        { value: 'emergency', label: '🚨 Emergency (2x price)', color: 'red' }
                      ].map(({ value, label, color }) => (
                        <button
                          key={value}
                          onClick={() => setBookingData(prev => ({ ...prev, urgency: value as any }))}
                          className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                            bookingData.urgency === value
                              ? `border-${color}-500 bg-${color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Find Providers Button */}
                {bookingData.location.area && (
                  <div className="text-center">
                    <button
                      onClick={searchProviders}
                      className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all transform hover:scale-105 flex items-center mx-auto"
                    >
                      <FaSearch className="mr-2" />
                      Find Available Providers
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Provider Selection */}
            {showProviders && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 border-t pt-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  👥 Choose Your Provider
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        bookingData.selectedProvider?.id === provider.id
                          ? 'border-orange-500 bg-orange-50 shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUser className="h-8 w-8 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <FaStar className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-gray-600">
                              {provider.rating} ({provider.reviews} reviews)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{provider.experience} experience</p>
                          <div className="flex items-center mt-2">
                            <FaPhone className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600">{provider.phone}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.provider && <p className="text-red-600">{errors.provider}</p>}
              </motion.div>
            )}

            {/* Step 4: Payment & Confirmation */}
            {bookingData.selectedProvider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 border-t pt-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  💳 Payment & Confirmation
                </h2>

                {/* Price Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Service: {bookingData.category?.name}</span>
                      <span>KES {bookingData.category?.basePrice.toLocaleString()}</span>
                    </div>
                    {bookingData.urgency !== 'normal' && (
                      <div className="flex justify-between text-orange-600">
                        <span>
                          {bookingData.urgency === 'urgent' ? 'Urgent' : 'Emergency'} multiplier
                        </span>
                        <span>
                          {bookingData.urgency === 'urgent' ? '1.5x' : '2x'}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>KES {calculatePrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Timing */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">When would you like to pay?</h4>
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
                        <h5 className="font-bold">Pay Now</h5>
                        <p className="text-sm text-gray-600">Secure your booking immediately</p>
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
                        <h5 className="font-bold">Pay After Service</h5>
                        <p className="text-sm text-gray-600">Pay when work is completed</p>
                      </div>
                    </button>
                  </div>
                  {errors.paymentTiming && <p className="text-red-600">{errors.paymentTiming}</p>}
                </div>

                {/* Payment Method */}
                {bookingData.paymentTiming && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Payment Method:</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'mobile-money' }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                          bookingData.paymentMethod === 'mobile-money'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="mr-3 text-2xl">📱</span>
                        <div className="text-left">
                          <div className="font-bold">M-Pesa Mobile Money</div>
                          <div className="text-sm text-gray-600">Instant STK Push</div>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setBookingData(prev => ({ ...prev, paymentMethod: 'card' }))}
                        className={`w-full p-4 rounded-lg border-2 transition-all flex items-center ${
                          bookingData.paymentMethod === 'card'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <span className="mr-3 text-2xl">💳</span>
                        <div className="text-left">
                          <div className="font-bold">Debit/Credit Card</div>
                          <div className="text-sm text-gray-600">Visa, Mastercard</div>
                        </div>
                      </button>
                    </div>
                    {errors.paymentMethod && <p className="text-red-600">{errors.paymentMethod}</p>}
                  </div>
                )}

                {/* Final Booking Button */}
                {bookingData.paymentTiming && bookingData.paymentMethod && (
                  <div className="text-center pt-6">
                    <button
                      onClick={handleFinalBooking}
                      disabled={loading}
                      className="px-12 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 flex items-center mx-auto text-lg disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          {bookingData.paymentTiming === 'pay-now' 
                            ? '💳 Confirm & Pay Now' 
                            : '📝 Confirm Booking'
                          }
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Error Display */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{errors.general}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

// Loading component
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

// Main export
export default function BookServicePage() {
  return (
    <Suspense fallback={<BookServicePageLoading />}>
      <SimpleBookServiceContent />
    </Suspense>
  )
}