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
      details: '+254 123 456 789',
      description: 'Call us for immediate assistance',
      color: 'bg-orange-600'
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      details: '+254 123 456 789',
      description: 'Message us on WhatsApp',
      color: 'bg-green-600'
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      details: 'info@solutil.com',
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              Contact{' '}
              <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                Us
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Get in touch with our team for professional service booking, questions, or support.
              We&apos;re here to help make your home service experience seamless.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200/50 dark:border-slate-700/50 text-center"
              >
                <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <info.icon className="text-white text-xl" />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {info.title}
                </h3>
                
                <p className="text-lg font-medium text-orange-600 dark:text-orange-400 mb-2">
                  {info.details}
                </p>
                
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {info.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form and Business Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Send us a Message
                </h2>
                
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCheckCircle className="text-white text-2xl" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Thank you for contacting us. We&apos;ll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                          Service Interested In
                        </label>
                        <select
                          value={formData.service}
                          onChange={(e) => handleInputChange('service', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        >
                          <option value="">Select a service</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="carpentry">Carpentry</option>
                          <option value="painting">Painting</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        placeholder="Tell us about your service needs or ask any questions..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center space-x-2"
                    >
                      <FaPaperPlane />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {/* Business Hours Card */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                    <FaClock className="text-white text-sm" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Business Hours
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-300 text-sm">
                        {schedule.day}
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white text-sm">
                        {schedule.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Need Immediate Help?</h3>
                <div className="space-y-3">
                  <a
                    href="tel:+254123456789"
                    className="flex items-center space-x-3 bg-white/20 rounded-xl p-3 hover:bg-white/30 transition-colors"
                  >
                    <FaPhone className="text-lg" />
                    <span>Call Now</span>
                  </a>
                  
                  <a
                    href="https://wa.me/254123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 bg-white/20 rounded-xl p-3 hover:bg-white/30 transition-colors"
                  >
                    <FaWhatsapp className="text-lg" />
                    <span>WhatsApp Us</span>
                  </a>
                  
                  <Link
                    href="/booking"
                    className="flex items-center space-x-3 bg-white text-orange-600 rounded-xl p-3 hover:bg-slate-100 transition-colors font-medium"
                  >
                    <FaWrench className="text-lg" />
                    <span>Book Service</span>
                  </Link>
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
