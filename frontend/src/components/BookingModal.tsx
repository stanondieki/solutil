'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaTimes, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaStar,
  FaCheck,
  FaArrowRight,
  FaCreditCard,
  FaMobile
} from 'react-icons/fa'
import { useToast } from '@/components/ui/Toast'

interface Provider {
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
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  service: {
    name: string
    icon: any
    description: string
  } | null
  onBookingComplete?: (bookingData: any) => void
}

const mockProviders: Provider[] = [
  {
    id: '1',
    name: 'John Kamau',
    rating: 4.9,
    reviews: 127,
    price: 2500,
    image: '/api/placeholder/60/60',
    distance: '2.1 km away',
    experience: '5 years',
    specialties: ['Residential', 'Commercial', 'Emergency'],
    availability: ['Today', 'Tomorrow', 'This Week']
  },
  {
    id: '2',
    name: 'Sarah Wanjiku',
    rating: 4.8,
    reviews: 89,
    price: 2200,
    image: '/api/placeholder/60/60',
    distance: '1.5 km away',
    experience: '3 years',
    specialties: ['Home Repair', 'Maintenance', 'Installation'],
    availability: ['Today', 'Tomorrow']
  },
  {
    id: '3',
    name: 'Michael Ochieng',
    rating: 4.7,
    reviews: 156,
    price: 2800,
    image: '/api/placeholder/60/60',
    distance: '3.2 km away',
    experience: '7 years',
    specialties: ['Industrial', 'Residential', 'Wiring'],
    availability: ['Tomorrow', 'This Week']
  }
]

export default function BookingModal({ isOpen, onClose, service, onBookingComplete }: BookingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({
    location: '',
    description: '',
    urgency: 'normal',
    contactPhone: '',
    contactEmail: ''
  })
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [paymentTiming, setPaymentTiming] = useState('pay-now')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError } = useToast()
  const [bookingComplete, setBookingComplete] = useState(false)

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM'
  ]

  // Fetch available time slots when date changes
  const fetchAvailableSlots = async (date: string, providerId: string) => {
    setIsLoadingSlots(true)
    setAvailableSlots([])
    
    try {
      // This would call a real API to get provider availability
      // For now, simulate with filtered time slots
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate some slots being unavailable
      const allSlots = timeSlots
      const unavailableSlots = ['10:00 AM', '02:00 PM', '05:00 PM'] // Mock unavailable slots
      const available = allSlots.filter(slot => !unavailableSlots.includes(slot))
      
      setAvailableSlots(available)
    } catch (error) {
      console.error('Failed to fetch available slots:', error)
      setAvailableSlots(timeSlots) // Fallback to all slots
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Handle date selection
  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTime('') // Reset time when date changes
    
    if (selectedProvider && date) {
      fetchAvailableSlots(date, selectedProvider.id)
    }
  }

  const getNextWeekDates = () => {
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    return dates
  }

  const handleSubmitBooking = async () => {
    setIsSubmitting(true)
    
    try {
      // Get user data and auth token
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      const authToken = localStorage.getItem('authToken')
      
      if (!authToken) {
        throw new Error('Authentication required')
      }

      // Create booking data with modern structure
      const bookingData = {
        provider: selectedProvider?.id, // This should be a real provider ID
        service: '507f1f77bcf86cd799439011', // This should be the actual service ID
        scheduledDate: new Date(selectedDate).toISOString(),
        scheduledTime: {
          start: selectedTime,
          end: getEndTime(selectedTime) // Calculate end time based on service duration
        },
        location: {
          address: bookingDetails.location,
          coordinates: {
            lat: 0, // These should be real coordinates from geocoding
            lng: 0
          },
          instructions: bookingDetails.description
        },
        pricing: {
          basePrice: selectedProvider?.price || 2500,
          totalAmount: selectedProvider?.price || 2500,
          currency: 'KES'
        },
        payment: {
          method: paymentMethod,
          timing: paymentTiming,
          status: 'pending'
        },
        paymentTiming: paymentTiming,
        paymentMethod: paymentMethod,
        notes: bookingDetails.description
      }

      console.log('Creating booking with data:', bookingData)
      console.log('Auth token:', authToken)

      // Call the booking API
      console.log('Sending request to /api/bookings...')
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingData,
          authToken
        }),
      })
      
      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      const result = await response.json()
      console.log('Booking response:', result)
      console.log('Full response data:', JSON.stringify(result, null, 2))

      if (response.ok) {
        setBookingComplete(true)
        
        // Call the completion callback with the actual booking data
        if (onBookingComplete) {
          setTimeout(() => {
            onBookingComplete(result.data.booking)
          }, 2000)
        }
      } else {
        throw new Error(result.message || 'Failed to create booking')
      }

    } catch (error) {
      console.error('Booking creation error:', error)
      showError(
        'Booking Failed',
        `${(error as any)?.message || 'Unknown error'}`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper function to calculate end time based on start time
  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':')
    const startHour = parseInt(hours)
    const period = startTime.includes('PM') ? 'PM' : 'AM'
    
    // Default to 2-hour service duration
    let endHour = startHour + 2
    if (endHour > 12 && period === 'AM') {
      endHour = endHour - 12
    }
    
    return `${endHour.toString().padStart(2, '0')}:${minutes}`
  }

  const resetModal = () => {
    setStep(1)
    setSelectedProvider(null)
    setSelectedDate('')
    setSelectedTime('')
    setBookingDetails({
      location: '',
      description: '',
      urgency: 'normal',
      contactPhone: '',
      contactEmail: ''
    })
    setBookingComplete(false)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  if (!service) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <service.icon className="text-2xl" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Book {service.name}</h2>
                    <p className="opacity-90">{service.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center mt-6 space-x-4">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      step >= stepNumber 
                        ? 'bg-white text-orange-500 border-white' 
                        : 'border-white border-opacity-50 text-white'
                    }`}>
                      {step > stepNumber ? <FaCheck className="text-sm" /> : stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${
                        step > stepNumber ? 'bg-white' : 'bg-white bg-opacity-30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!bookingComplete ? (
                <>
                  {/* Step 1: Select Provider */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Service Provider</h3>
                      
                      {mockProviders.map((provider) => (
                        <motion.div
                          key={provider.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                            selectedProvider?.id === provider.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                          onClick={() => setSelectedProvider(provider)}
                        >
                          <div className="flex items-center space-x-4">
                            <img
                              src={provider.image}
                              alt={provider.name}
                              className="w-16 h-16 rounded-full object-cover bg-gray-200"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                                <div className="text-right">
                                  <div className="text-xl font-bold text-orange-600">KSh {provider.price}</div>
                                  <div className="text-sm text-gray-500">per service</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <FaStar className="text-yellow-400 mr-1" />
                                  <span>{provider.rating} ({provider.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center">
                                  <FaMapMarkerAlt className="text-gray-400 mr-1" />
                                  <span>{provider.distance}</span>
                                </div>
                                <div className="flex items-center">
                                  <FaUser className="text-gray-400 mr-1" />
                                  <span>{provider.experience} experience</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                {provider.specialties.map((specialty, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                                  >
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 2: Select Date & Time */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time</h3>
                        
                        {/* Selected Provider Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                          <div className="flex items-center space-x-3">
                            <img
                              src={selectedProvider?.image}
                              alt={selectedProvider?.name}
                              className="w-12 h-12 rounded-full object-cover bg-gray-200"
                            />
                            <div>
                              <h4 className="font-semibold">{selectedProvider?.name}</h4>
                              <p className="text-sm text-gray-600">KSh {selectedProvider?.price} • {selectedProvider?.distance}</p>
                            </div>
                          </div>
                        </div>

                        {/* Date Selection */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-3">Choose Date</label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {getNextWeekDates().map((date) => (
                              <motion.button
                                key={date.value}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedDate(date.value)}
                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                  selectedDate === date.value
                                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                                    : 'border-gray-200 hover:border-orange-300'
                                }`}
                              >
                                {date.label}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Time Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Choose Time
                            {isLoadingSlots && (
                              <span className="text-xs text-gray-500 ml-2">(Loading availability...)</span>
                            )}
                          </label>
                          {selectedDate ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {isLoadingSlots ? (
                                // Loading skeleton
                                Array.from({ length: 8 }).map((_, index) => (
                                  <div key={index} className="p-3 rounded-lg bg-gray-100 animate-pulse h-10"></div>
                                ))
                              ) : (
                                (availableSlots.length > 0 ? availableSlots : timeSlots).map((time) => {
                                  const isAvailable = availableSlots.length === 0 || availableSlots.includes(time)
                                  return (
                                    <motion.button
                                      key={time}
                                      whileHover={isAvailable ? { scale: 1.05 } : {}}
                                      whileTap={isAvailable ? { scale: 0.95 } : {}}
                                      onClick={() => isAvailable && setSelectedTime(time)}
                                      disabled={!isAvailable}
                                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                        selectedTime === time
                                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                                          : isAvailable
                                          ? 'border-gray-200 hover:border-orange-300'
                                          : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                      }`}
                                    >
                                      {time}
                                      {!isAvailable && (
                                        <div className="text-xs mt-1">Unavailable</div>
                                      )}
                                    </motion.button>
                                  )
                                })
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm py-4">
                              Please select a date first to see available time slots
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Booking Details */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaMapMarkerAlt className="inline mr-2" />
                            Service Location
                          </label>
                          <input
                            type="text"
                            value={bookingDetails.location}
                            onChange={(e) => setBookingDetails({...bookingDetails, location: e.target.value})}
                            placeholder="Enter your address"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaPhone className="inline mr-2" />
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={bookingDetails.contactPhone}
                            onChange={(e) => setBookingDetails({...bookingDetails, contactPhone: e.target.value})}
                            placeholder="e.g., 0712345678"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Description</label>
                        <textarea
                          value={bookingDetails.description}
                          onChange={(e) => setBookingDetails({...bookingDetails, description: e.target.value})}
                          placeholder="Describe what you need help with..."
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'low', label: 'Low Priority', color: 'bg-green-50 border-green-200 text-green-700' },
                            { value: 'normal', label: 'Normal', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                            { value: 'urgent', label: 'Urgent', color: 'bg-red-50 border-red-200 text-red-700' }
                          ].map((urgency) => (
                            <motion.button
                              key={urgency.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setBookingDetails({...bookingDetails, urgency: urgency.value})}
                              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                bookingDetails.urgency === urgency.value
                                  ? urgency.color
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {urgency.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Confirmation & Payment */}
                  {step === 4 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Your Booking</h3>
                      
                      {/* Booking Summary */}
                      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Service Provider</span>
                          <span>{selectedProvider?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Service</span>
                          <span>{service.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Date & Time</span>
                          <span>{getNextWeekDates().find(d => d.value === selectedDate)?.label} at {selectedTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Location</span>
                          <span className="text-right">{bookingDetails.location}</span>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="flex items-center justify-between text-lg">
                          <span className="font-semibold">Total Amount</span>
                          <span className="font-bold text-orange-600">KSh {selectedProvider?.price}</span>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPaymentMethod('mpesa')
                              setPaymentTiming('pay-now')
                            }}
                            className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg ${
                              paymentMethod === 'mpesa' && paymentTiming === 'pay-now'
                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <FaMobile className="text-xl" />
                            <span className="font-medium">M-Pesa Now</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPaymentMethod('card')
                              setPaymentTiming('pay-now')
                            }}
                            className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg ${
                              paymentMethod === 'card' && paymentTiming === 'pay-now'
                                ? 'border-purple-500 bg-purple-50 text-purple-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <FaCreditCard className="text-xl" />
                            <span className="font-medium">Card Now</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setPaymentMethod('cash')
                              setPaymentTiming('pay-after')
                            }}
                            className={`flex items-center justify-center space-x-3 p-4 border-2 rounded-lg ${
                              paymentTiming === 'pay-after'
                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <FaClock className="text-xl" />
                            <span className="font-medium">Pay Later</span>
                          </motion.button>
                        </div>
                        <div className="text-sm text-gray-500 mt-3 p-3 bg-gray-50 rounded-lg">
                          {paymentTiming === 'pay-after' ? (
                            <div className="text-blue-600">
                              💡 <strong>Pay After Service:</strong> Your booking will be confirmed immediately. You'll pay the provider directly after the service is completed to your satisfaction.
                            </div>
                          ) : (
                            <div className="text-orange-600">
                              🔒 <strong>Pay Now:</strong> Secure payment processed immediately. Service provider will be notified once payment is confirmed.
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                /* Booking Complete */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <FaCheck className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                  <p className="text-gray-600 mb-6">
                    Your {service.name} service has been booked with {selectedProvider?.name}.
                    You'll receive a confirmation message shortly.
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-gray-600">
                      <strong>Booking ID:</strong> SOL-{Date.now().toString().slice(-6)}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium"
                  >
                    Back to Dashboard
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            {!bookingComplete && (
              <div className="border-t bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (step === 4) {
                        handleSubmitBooking()
                      } else {
                        setStep(step + 1)
                      }
                    }}
                    disabled={
                      (step === 1 && !selectedProvider) ||
                      (step === 2 && (!selectedDate || !selectedTime)) ||
                      (step === 3 && (!bookingDetails.location || !bookingDetails.contactPhone)) ||
                      isSubmitting
                    }
                    className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>{step === 4 ? 'Confirm Booking' : 'Continue'}</span>
                        <FaArrowRight />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
