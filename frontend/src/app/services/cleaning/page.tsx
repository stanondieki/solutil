'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { 
  FaStar,
  FaHome,
  FaClock,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaTools,
  FaHeart,
  FaLeaf,
  FaUsers,
  FaAward
} from 'react-icons/fa';

const cleaningServices = [
  {
    id: 'basic-1-2bed',
    name: 'Basic cleaning (1-2 bedrooms)',
    priceRange: { min: 1800, max: 3000 },
    description: 'Standard house cleaning for small apartments including sweeping, mopping, dusting, and basic sanitization',
    features: ['General cleaning', 'Sweeping & mopping', 'Dusting surfaces', 'Bathroom cleaning'],
    duration: '2-4 hours',
    popular: true,
    image: '/images/services/basic_clean.webp'
  },
  {
    id: 'basic-3-4bed',
    name: 'Standard cleaning (3-4 bedrooms)',
    priceRange: { min: 3000, max: 4500 },
    description: 'Comprehensive cleaning for medium-sized homes with detailed attention to all rooms',
    features: ['Deep room cleaning', 'Kitchen deep clean', 'Bathroom sanitization', 'Living area organization'],
    duration: '3-5 hours',
    popular: true,
    image: '/images/services/standard.webp'
  },
  {
    id: 'deep-cleaning',
    name: 'Deep cleaning service',
    priceRange: { min: 4000, max: 8000 },
    description: 'Intensive deep cleaning service including hard-to-reach areas and detailed sanitization',
    features: ['Deep scrubbing', 'Inside appliances', 'Window cleaning', 'Carpet cleaning', 'Detailed sanitization'],
    duration: '4-8 hours',
    premium: true,
    image: '/images/services/deep_cleaner.webp'
  },
  {
    id: 'move-in-out',
    name: 'Move-in/Move-out cleaning',
    priceRange: { min: 5000, max: 12000 },
    description: 'Complete property cleaning for moving situations with thorough sanitization',
    features: ['Complete property clean', 'Inside all cabinets', 'Deep sanitization', 'Move-ready condition'],
    duration: '5-10 hours',
    premium: true,
    image: '/images/services/move_cleaning.jpg'
  },
  {
    id: 'office-cleaning',
    name: 'Office/Commercial cleaning',
    priceRange: { min: 2500, max: 8000 },
    description: 'Professional office cleaning services for businesses and commercial spaces',
    features: ['Workspace cleaning', 'Reception area', 'Meeting rooms', 'Restroom sanitization'],
    duration: '2-6 hours',
    image: '/images/services/office.jpg'
  },
  {
    id: 'post-construction',
    name: 'Post-construction cleaning',
    priceRange: { min: 8000, max: 15000 },
    description: 'Specialized cleaning after construction or renovation work',
    features: ['Debris removal', 'Dust elimination', 'Surface restoration', 'Safety cleanup'],
    duration: '6-12 hours',
    premium: true,
    image: '/images/services/postconstruction.jpg'
  }
];

const features = [
  {
    icon: FaShieldAlt,
    title: 'Insured & Bonded',
    description: 'All our cleaning staff are fully insured and background-checked for your peace of mind.'
  },
  {
    icon: FaLeaf,
    title: 'Eco-Friendly Products',
    description: 'We use environmentally safe cleaning products that are safe for your family and pets.'
  },
  {
    icon: FaUsers,
    title: 'Trained Professionals',
    description: 'Our cleaning team is professionally trained and experienced in all types of cleaning services.'
  },
  {
    icon: FaClock,
    title: 'Flexible Scheduling',
    description: 'Book cleaning services at your convenience with same-day and weekend availability.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    rating: 5,
    comment: 'Exceptional cleaning service! My house has never looked better. The team was professional and thorough.',
    service: 'Deep cleaning service',
    image: '/images/testimonials/sarah.jpg'
  },
  {
    name: 'Michael Chen',
    rating: 5,
    comment: 'Perfect for our office space. They come weekly and maintain excellent standards. Highly recommended!',
    service: 'Office cleaning',
    image: '/images/testimonials/michael.jpg'
  },
  {
    name: 'Emma Wilson',
    rating: 5,
    comment: 'The move-out cleaning was fantastic. Got my full deposit back thanks to their thorough work.',
    service: 'Move-out cleaning',
    image: '/images/testimonials/emma.jpg'
  }
];

export default function CleaningServicesPage() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-white/10 to-blue-300/20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-300/20 to-purple-300/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6"
              >
                <FaStar className="mr-2 text-yellow-300" />
                Professional Cleaning Services
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Spotless Homes,{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Happy Living
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-blue-100 mb-8 leading-relaxed"
              >
                Transform your home with our professional cleaning services. From basic maintenance to deep cleaning, 
                we provide exceptional service that exceeds expectations.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-3 gap-6 mb-8"
              >
                {[
                  { number: '500+', label: 'Happy Customers' },
                  { number: '4.9', label: 'Average Rating' },
                  { number: '2hr', label: 'Response Time' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-blue-200">{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/book-service"
                  className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105"
                >
                  Book Cleaning Service
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight className="ml-2" />
                  </motion.div>
                </Link>
                
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  View Pricing
                </button>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <Image
                    src="/images/services/cleaning_hero.jpg"
                    alt="Professional Cleaning Services"
                    width={500}
                    height={400}
                    className="rounded-2xl object-cover w-full h-80"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
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
              Our Cleaning{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of cleaning services designed to meet all your needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cleaningServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
                {/* Popular/Premium Badges */}
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Popular
                  </div>
                )}
                {service.premium && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Premium
                  </div>
                )}

                {/* Service Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {service.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-blue-600">
                      KES {service.priceRange.min.toLocaleString()} - {service.priceRange.max.toLocaleString()}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <FaClock className="mr-1" />
                      {service.duration}
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                        >
                          <FaCheckCircle className="mr-1 text-blue-500" />
                          {feature}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                          +{service.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <Link
                    href={`/book-service?service=${service.id}&category=cleaning`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center group-hover:shadow-lg"
                  >
                    Book This Service
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Why Choose Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cleaning Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're committed to providing exceptional cleaning services that exceed your expectations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                  className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                >
                  <feature.icon className="text-white text-3xl" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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
              What Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-gradient-to-br from-white to-blue-50/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50"
              >
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-slate-900">{testimonial.name}</h4>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-sm" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-3 leading-relaxed">
                  "{testimonial.comment}"
                </p>
                
                <div className="text-sm text-blue-600 font-medium">
                  {testimonial.service}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-800/90"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <FaStar className="text-4xl text-yellow-300" />
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready for a Spotless Home?
            </h2>
            
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Book your cleaning service today and experience the difference professional cleaning makes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/book-service?category=cleaning"
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl flex items-center space-x-3 hover:scale-105"
              >
                <span>Book Cleaning Service</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FaArrowRight />
                </motion.div>
              </Link>
              
              <a
                href="tel:+254717855249"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
              >
                <span>Call Now</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📞
                </motion.div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}