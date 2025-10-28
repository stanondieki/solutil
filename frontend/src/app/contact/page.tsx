'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaWrench, 
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaCheckCircle,
  FaCopy,
  FaSpinner,
  FaMapPin,
  FaCalendarAlt,
  FaUserCircle
} from 'react-icons/fa';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formProgress, setFormProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<string>('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Contact form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    }, 3000);
  };

  // Smart Contact Methods
  const handlePhoneCall = () => {
    window.location.href = 'tel:+254717855249';
  };

  const handleWhatsAppMessage = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about your services.');
    window.open(`https://wa.me/254717855249?text=${message}`, '_blank');
  };

  const handleEmailCopy = async () => {
    try {
      await navigator.clipboard.writeText('info@solutilconnect.com');
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleLocationClick = () => {
    window.open('https://maps.google.com/?q=Nairobi,Kenya', '_blank');
  };



  // Calculate form progress
  useEffect(() => {
    const fields = Object.values(formData);
    const filledFields = fields.filter(field => field.trim() !== '').length;
    const progress = (filledFields / fields.length) * 100;
    setFormProgress(progress);
  }, [formData]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get user location and load preferences
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // This would typically use a reverse geocoding service
          setUserLocation('Nairobi, Kenya');
          // Save location preference
          localStorage.setItem('userLocation', 'Nairobi, Kenya');
        },
        (error) => {
          // Load saved location
          const savedLocation = localStorage.getItem('userLocation');
          if (savedLocation) {
            setUserLocation(savedLocation);
          }
        }
      );
    }

    // Load saved form data
    const savedFormData = localStorage.getItem('contactFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.log('Error loading saved form data');
      }
    }
  }, []);

  // Save form data as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name || formData.email || formData.phone) {
        localStorage.setItem('contactFormData', JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Business hours checker
  const isBusinessOpen = () => {
    const now = currentTime;
    const day = now.getDay();
    const hour = now.getHours();
    
    if (day >= 1 && day <= 5) { // Monday-Friday
      return hour >= 8 && hour < 18;
    } else if (day === 6) { // Saturday
      return hour >= 9 && hour < 17;
    } else { // Sunday
      return hour >= 10 && hour < 16;
    }
  };

  const contactInfo = [
    {
      icon: FaPhone,
      title: 'Phone',
      details: '0717855249',
      description: 'Call us for immediate assistance',
      color: 'bg-orange-600'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      details: '0717855249',
      description: 'Message us on WhatsApp',
      color: 'bg-green-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: 'info@solutilconnect.com',
      description: 'Send us an email',
      color: 'bg-purple-600'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Location',
      details: 'Nairobi, Kenya',
      description: 'We serve all areas in Nairobi',
      color: 'bg-red-600'
    }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 5:00 PM' },
    { day: 'Sunday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Emergency Services', hours: '24/7 Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-28 lg:py-40 bg-gradient-to-br from-white via-slate-50/30 to-indigo-50/20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-orange-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <FaEnvelope className="text-white text-3xl" />
            </motion.div>

            {/* Personalized Greeting */}
            {formData.name && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 font-semibold">
                  <FaUserCircle className="mr-2" />
                  Welcome back, {formData.name}!
                </div>
              </motion.div>
            )}

            {userLocation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mb-8"
              >
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm">
                  <FaMapMarkerAlt className="mr-2" />
                  Serving {userLocation}
                </div>
              </motion.div>
            )}
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-12 leading-tight tracking-tight">
              Get in{' '}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Touch
              </span>
            </h1>
            
            <p className="text-3xl text-slate-800 mb-14 max-w-5xl mx-auto leading-relaxed font-semibold">
              Ready to transform your home? Our expert team is here to help you every step of the way. 
              Let&apos;s discuss your project and make it a reality.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 Emergency Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Quick Response Time</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Free Consultations</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-8">
              Multiple Ways to{' '}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Reach Us
              </span>
            </h2>
            <p className="text-2xl text-slate-800 max-w-3xl mx-auto leading-relaxed font-semibold">
              Choose your preferred method of communication. We&apos;re always ready to help!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Animated gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  info.title === 'Phone' ? 'from-orange-500/10 to-red-500/10' :
                  info.title === 'WhatsApp' ? 'from-green-500/10 to-emerald-500/10' :
                  info.title === 'Email' ? 'from-purple-500/10 to-indigo-500/10' :
                  'from-red-500/10 to-pink-500/10'
                } rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 text-center h-full flex flex-col justify-between">
                  {/* Subtle top accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                    info.title === 'Phone' ? 'from-orange-500 to-red-500' :
                    info.title === 'WhatsApp' ? 'from-green-500 to-emerald-500' :
                    info.title === 'Email' ? 'from-purple-500 to-indigo-500' :
                    'from-red-500 to-pink-500'
                  } rounded-t-2xl`}></div>
                  
                  {/* Icon */}
                  <div className="flex-1">
                    <motion.div 
                      className={`w-14 h-14 ${info.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <info.icon className="text-white text-xl" />
                    </motion.div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      {info.title}
                    </h3>
                    
                    {/* Contact Details */}
                    <div className="mb-3">
                      {info.title === 'Email' ? (
                        <p className="text-sm font-semibold text-orange-600 break-words leading-tight">
                          {info.details}
                        </p>
                      ) : (
                        <p className="text-base font-bold text-orange-600">
                          {info.details}
                        </p>
                      )}
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {info.description}
                    </p>
                  </div>

                  {/* Smart Interactive Buttons */}
                  {info.title === 'Phone' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePhoneCall}
                      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center gap-2"
                    >
                      <FaPhone className="text-xs" />
                      Call Now
                    </motion.button>
                  )}
                  
                  {info.title === 'WhatsApp' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleWhatsAppMessage}
                      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="text-xs" />
                      Message
                    </motion.button>
                  )}
                  
                  {info.title === 'Email' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEmailCopy}
                      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 flex items-center justify-center gap-2"
                    >
                      {copiedEmail ? (
                        <>
                          <FaCheckCircle className="text-xs" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy className="text-xs" />
                          Copy Email
                        </>
                      )}
                    </motion.button>
                  )}
                  
                  {info.title === 'Location' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLocationClick}
                      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center gap-2"
                    >
                      <FaMapPin className="text-xs" />
                      View Map
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form and Business Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="relative group">
                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative bg-white rounded-3xl p-12 shadow-2xl border border-gray-100 overflow-hidden">
                  {/* Background decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-50/50 to-transparent rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-red-50/30 to-transparent rounded-tr-full"></div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaPaperPlane className="text-white text-xl" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-gray-900">
                          Send us a Message
                        </h2>
                        <p className="text-gray-700 text-lg font-medium">We&apos;d love to hear from you</p>
                      </div>
                    </div>
                    
                    {isSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                        >
                          <FaCheckCircle className="text-white text-3xl" />
                        </motion.div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">
                          Message Sent Successfully!
                        </h3>
                        <p className="text-gray-700 text-xl font-medium">
                          Thank you for reaching out. Our team will get back to you within 24 hours.
                        </p>
                        <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                          <p className="text-green-700 text-base font-medium">
                            💡 Tip: For urgent matters, call us directly or use WhatsApp for faster response
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-6">
                        {/* Form Progress Indicator */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">Form Progress</span>
                            <span className="text-sm font-medium text-orange-600">{Math.round(formProgress)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <motion.div 
                              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${formProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="Enter your full name"
                            />
                          </motion.div>
                          
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="Enter your email"
                            />
                          </motion.div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm"
                              placeholder="+254 123 456 789"
                            />
                          </motion.div>
                          
                          <motion.div
                            whileFocus={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                              Service Interested In
                            </label>
                            <select
                              value={formData.service}
                              onChange={(e) => handleInputChange('service', e.target.value)}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm"
                            >
                              <option value="">Select a service</option>
                              <option value="plumbing">Plumbing</option>
                              <option value="electrical">Electrical</option>
                              <option value="cleaning">Cleaning</option>
                              <option value="carpentry">Carpentry</option>
                              <option value="painting">Painting</option>
                              <option value="other">Other</option>
                            </select>
                          </motion.div>
                        </div>
                        
                        <motion.div
                          whileFocus={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Message *
                          </label>
                          <textarea
                            required
                            rows={6}
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 backdrop-blur-sm resize-none"
                            placeholder="Tell us about your service needs or ask any questions..."
                          />
                        </motion.div>
                        
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-8 py-5 rounded-2xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl text-lg"
                        >
                          <FaPaperPlane className="text-xl" />
                          <span>Send Message</span>
                        </motion.button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Business Hours & Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Business Hours Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/20 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-50/50 to-transparent rounded-bl-3xl"></div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-4 mb-6">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 15, scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaClock className="text-white text-xl" />
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Business Hours
                          </h3>
                          <motion.div 
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                              isBusinessOpen() 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className={`w-2 h-2 rounded-full ${
                              isBusinessOpen() ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            {isBusinessOpen() ? 'OPEN NOW' : 'CLOSED'}
                          </motion.div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Current time: {currentTime.toLocaleTimeString()} | {userLocation || 'Nairobi, Kenya'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {businessHours.map((schedule, index) => (
                        <motion.div 
                          key={index} 
                          className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-300"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {schedule.day}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {schedule.hours}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-red-400/30 to-pink-400/30 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
                  {/* Background decorations */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full"></div>
                  
                  <div className="relative">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <FaPhone className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Need Immediate Help?</h3>
                        <p className="text-white/80 text-sm">We&apos;re just a click away</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <motion.a
                        href="tel:+254123456789"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/25 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaPhone className="text-xl" />
                        </div>
                        <div>
                          <span className="font-semibold block">Call Now</span>
                          <span className="text-white/80 text-sm">+254 717855249 </span>
                        </div>
                      </motion.a>
                      
                      <motion.a
                        href="https://wa.me/254717855249"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center space-x-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/25 transition-all duration-300 border border-white/10"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FaWhatsapp className="text-xl" />
                        </div>
                        <div>
                          <span className="font-semibold block">WhatsApp Us</span>
                          <span className="text-white/80 text-sm">Quick messaging</span>
                        </div>
                      </motion.a>
                      
                      <motion.div className="relative">
                        <Link
                          href="/services/all"
                          className="block"
                        >
                          <motion.div
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center space-x-4 bg-white text-orange-600 rounded-2xl p-4 hover:bg-slate-50 transition-all duration-300 font-semibold shadow-lg"
                          >
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                              <FaWrench className="text-xl text-orange-600" />
                            </div>
                            <div>
                              <span className="font-semibold block">Book Service</span>
                              <span className="text-orange-500 text-sm">Start your project</span>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleWhatsAppMessage}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl flex items-center gap-3 group"
        >
          <FaWhatsapp className="text-2xl" />
          <AnimatePresence>
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden group-hover:block text-sm font-medium whitespace-nowrap overflow-hidden"
            >
              Chat with us!
            </motion.span>
          </AnimatePresence>
        </motion.button>
        
        {/* Pulsing indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      {/* Floating Quick Actions */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 space-y-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handlePhoneCall}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 shadow-lg"
          title="Call Us Now"
        >
          <FaPhone className="text-lg" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, x: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleEmailCopy}
          className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-3 shadow-lg"
          title="Copy Email"
        >
          {copiedEmail ? <FaCheckCircle className="text-lg" /> : <FaEnvelope className="text-lg" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1, x: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLocationClick}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg"
          title="View Location"
        >
          <FaMapPin className="text-lg" />
        </motion.button>
      </motion.div>

      {/* Floating Success Notification */}
      <AnimatePresence>
        {copiedEmail && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <FaCheckCircle />
            <span>Email copied to clipboard!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Particles Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-orange-200/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Footer />
    </div>
  );
}
