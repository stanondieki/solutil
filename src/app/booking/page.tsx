'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaWrench, 
  FaLightbulb, 
  FaShower, 
  FaPaintRoller, 
  FaBroom,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';

const services = [
  { id: 'plumbing', title: 'Plumbing', icon: FaWrench, color: 'bg-orange-500' },
  { id: 'electrical', title: 'Electrical', icon: FaLightbulb, color: 'bg-yellow-500' },
  { id: 'cleaning', title: 'Cleaning', icon: FaBroom, color: 'bg-green-500' },
  { id: 'carpentry', title: 'Carpentry', icon: FaShower, color: 'bg-amber-600' },
  { id: 'painting', title: 'Painting', icon: FaPaintRoller, color: 'bg-purple-500' }
];

const timeSlots = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM'
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    service: searchParams?.get('service') || '',
    name: '',
    phone: '',
    location: '',
    date: '',
    time: '',
    description: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Get user data from localStorage for logged-in users
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    const bookingData = {
      ...formData,
      userId: user?.id || null,
      userEmail: user?.email || null,
      timestamp: new Date().toISOString()
    };

    // Here you would typically send the data to your backend
    console.log('Booking submitted:', bookingData);
    setIsSubmitted(true);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.service !== '';
      case 2:
        return formData.name !== '' && formData.phone !== '' && formData.location !== '';
      case 3:
        return formData.date !== '' && formData.time !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl text-center max-w-md mx-4"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-white text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Thank you for booking with Solutil. We&apos;ll send you an SMS confirmation and our professional will contact you shortly.
          </p>
          <Link
            href="/dashboard"
            className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-full hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  step <= currentStep 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    step < currentStep ? 'bg-orange-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm text-slate-600 dark:text-slate-300">
            <span>Service</span>
            <span>Details</span>
            <span>Schedule</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl"
        >
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Select a Service
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      formData.service === service.id
                        ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-orange-300'
                    }`}
                    onClick={() => handleInputChange('service', service.id)}
                  >
                    <div className={`w-12 h-12 ${service.color} rounded-xl flex items-center justify-center mb-4`}>
                      <service.icon className="text-white text-xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {service.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Your Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FaUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="+254 123 456 789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FaMapMarkerAlt className="inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your location in Nairobi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Choose Date & Time
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FaCalendarAlt className="inline mr-2" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    <FaClock className="inline mr-2" />
                    Preferred Time
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => handleInputChange('time', time)}
                        className={`p-3 rounded-xl border transition-all duration-300 ${
                          formData.time === time
                            ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                            : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Describe your service requirements..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
                Review Your Booking
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Booking Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Service:</span>
                      <span className="font-medium text-slate-900 dark:text-white capitalize">{formData.service}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Name:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Phone:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Location:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formData.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Date:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-300">Time:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{formData.time}</span>
                    </div>
                    {formData.description && (
                      <div>
                        <span className="text-slate-600 dark:text-slate-300">Details:</span>
                        <p className="font-medium text-slate-900 dark:text-white mt-1">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                Confirm Booking
              </button>
            )}
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}
