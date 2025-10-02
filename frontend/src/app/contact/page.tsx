'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
  FaCheckCircle
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Glowing background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 text-center overflow-hidden group-hover:border-orange-200">
                  {/* Background pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-100/50 to-transparent rounded-bl-3xl"></div>
                  
                  <motion.div 
                    className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <info.icon className="text-white text-2xl" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-orange-600 transition-colors duration-300">
                    {info.title}
                  </h3>
                  
                  <p className="text-xl font-black text-orange-600 mb-4">
                    {info.details}
                  </p>
                  
                  <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    {info.description}
                  </p>

                  {/* Interactive button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-200/50 dark:border-orange-700/50 rounded-xl text-sm font-medium text-orange-600 dark:text-orange-400 transition-all duration-300"
                  >
                    Contact Now
                  </motion.button>
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
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Business Hours
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">We&apos;re here when you need us</p>
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
                        href="https://wa.me/254123456789"
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

      <Footer />
    </div>
  );
}
