'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaStar,
  FaLightbulb,
  FaWrench,
  FaBug,
  FaTools,
  FaArrowRight,
  FaClock,
  FaCheckCircle,
  FaShieldAlt,
  FaAward,
  FaCheck
} from 'react-icons/fa';

const serviceCategories = [
  {
    id: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional cleaning services for homes and offices',
    detailedDescription: 'Comprehensive cleaning solutions from basic maintenance to deep cleaning',
    icon: FaStar,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    image: '/images/services/offer.png',
    priceRange: 'KES 1,800 - 15,000',
    serviceCount: '6+ Services',
    popular: true
  },
  {
    id: 'electrical',
    name: 'Electrical Services',
    description: 'Licensed electricians for all electrical work',
    detailedDescription: 'Professional electrical services including TV mounting and installations',
    icon: FaLightbulb,
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'from-yellow-50 to-orange-100',
    image: '/images/services/electrical_service.jpg',
    priceRange: 'KES 1,000 - 50,000',
    serviceCount: '6+ Services',
    featured: true
  },
  {
    id: 'plumbing',
    name: 'Plumbing Services',
    description: 'Expert plumbing services for your home',
    detailedDescription: 'Complete plumbing solutions from repairs to installations',
    icon: FaWrench,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-50 to-cyan-100',
    image: '/images/services/plumbing_hero.jpg',
    priceRange: 'KES 1,200 - 15,000',
    serviceCount: '6+ Services',
    popular: true
  },
  {
    id: 'fumigation',
    name: 'Fumigation Services', 
    description: 'Professional pest control and fumigation',
    detailedDescription: 'Safe and effective pest control solutions for homes and businesses',
    icon: FaBug,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-50 to-emerald-100',
    image: '/images/services/fumigation.webp',
    priceRange: 'KES 2,000 - 8,000',
    serviceCount: '4+ Services'
  },
  {
    id: 'general-repairs',
    name: 'General Repairs',
    description: 'Handyman services for all home repairs',
    detailedDescription: 'Professional repair services for various household needs',
    icon: FaTools,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'from-purple-50 to-indigo-100',
    image: '/images/services/general_repairs.webp',
    priceRange: 'KES 1,500 - 10,000',
    serviceCount: '8+ Services'
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
      <Navigation />

      {/* Hero Section */}
      <section className="py-28 lg:py-40 bg-gradient-to-br from-white via-slate-50/30 to-blue-50/20 relative overflow-hidden">
        {/* Premium background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/40 to-pink-200/40 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-12 leading-tight tracking-tight"
            >
              Our{' '}
              <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Services
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-3xl text-slate-800 mb-14 max-w-5xl mx-auto leading-relaxed font-semibold"
            >
              Professional home and office services delivered by trusted experts. Quality work, fair prices, and your satisfaction guaranteed.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Choose Your{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Service Category
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Browse through our service categories and find the perfect solution for your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                <Link href={`/services/${category.id}`}>
                  <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-gray-200 relative h-full cursor-pointer">
                    {/* Category Image Header */}
                    <div className="relative h-64 overflow-hidden">
                      {/* Background Image */}
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Dark overlay for text readability */}
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                          <span className="text-white text-sm font-semibold">{category.serviceCount}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm font-medium drop-shadow">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold text-slate-600">Price Range</div>
                        <div className="text-xl font-bold text-orange-600">
                          {category.priceRange}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-slate-500 mb-6">
                        <FaCheck className="text-green-500" />
                        <span className="text-sm">Professional & Trusted</span>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center px-6 py-3 rounded-2xl group-hover:from-orange-600 group-hover:to-red-600 transition-all duration-300 transform group-hover:scale-105 font-bold shadow-lg">
                        View All {category.name} Services
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-12 right-8 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-6xl font-black text-white mb-8">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Solutil?
              </span>
            </h2>
            <p className="text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-semibold">
              We're committed to providing exceptional service that exceeds your expectations
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-700 transition-colors shadow-2xl">
                <FaShieldAlt className="text-white text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">Trusted & Verified</h3>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                All our professionals are background-checked, licensed, and insured for your peace of mind
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-green-700 transition-colors shadow-2xl">
                <FaCheck className="text-white text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">Quality Guaranteed</h3>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                We stand behind our work with comprehensive warranties and satisfaction guarantees
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-purple-700 transition-colors shadow-2xl">
                <FaClock className="text-white text-4xl" />
              </div>
              <h3 className="text-3xl font-black text-white mb-6">On-Time Service</h3>
              <p className="text-slate-300 text-xl leading-relaxed font-medium">
                We respect your time and always arrive when scheduled, ready to deliver excellent work
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-500 to-red-500 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-5xl lg:text-6xl font-black mb-8">
              Ready to Book Your Service?
            </h2>
            <p className="text-3xl mb-12 opacity-90 max-w-3xl mx-auto font-semibold">
              Get started with professional, reliable service today
            </p>
            
            <Link
              href="/contact"
              className="inline-block bg-white text-orange-600 px-12 py-6 rounded-full text-2xl font-black hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              Get Free Quote
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}