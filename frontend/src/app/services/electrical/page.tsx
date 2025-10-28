'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { 
  FaLightbulb,
  FaBolt,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaTools,
  FaTv,
  FaPlug,
  FaUsers,
  FaAward,
  FaCog,
  FaHome
} from 'react-icons/fa';

const electricalServices = [
  {
    id: 'inspection',
    name: 'Electrical inspection / diagnosis',
    priceRange: { min: 1800, max: 3000 },
    description: 'Professional electrical system inspection and fault diagnosis by certified electricians',
    features: ['System diagnosis', 'Safety inspection', 'Problem identification', 'Professional report'],
    duration: '1-3 hours',
    popular: true,
    image: '/images/services/electrical_diagnosis.jpg'
  },
  {
    id: 'socket-installation',
    name: 'Socket / switch installation',
    priceRange: { min: 1000, max: 2000 },
    description: 'Professional installation of electrical sockets, switches, and outlets',
    features: ['Socket installation', 'Switch replacement', 'Outlet repair', 'Safety testing'],
    duration: '30min-2 hours',
    popular: true,
    image: '/images/services/socket_installation.jpg'
  },
  {
    id: 'tv-mounting',
    name: 'TV mounting',
    priceRange: { min: 2000, max: 6000 },
    description: 'Professional TV mounting service for all TV sizes with secure wall installation',
    features: ['Wall bracket installation', 'Cable management', 'All TV sizes supported', 'Secure mounting'],
    duration: '1-3 hours',
    popular: true,
    featured: true,
    image: '/images/services/tv_mounting.jpg'
  },
  {
    id: 'lighting-installation',
    name: 'Lighting fixture installation',
    priceRange: { min: 1500, max: 5000 },
    description: 'Install ceiling lights, chandeliers, pendant lights, and decorative fixtures',
    features: ['Ceiling lights', 'Chandeliers', 'Pendant lights', 'LED installation'],
    duration: '1-3 hours',
    image: '/images/services/lighting_installation.jpg'
  },
  {
    id: 'room-rewiring',
    name: 'Small rewiring (room or circuit)',
    priceRange: { min: 3500, max: 8000 },
    description: 'Complete rewiring of single rooms or electrical circuits with modern wiring',
    features: ['Circuit rewiring', 'Modern cables', 'Safety compliance', 'Testing included'],
    duration: '4-8 hours',
    premium: true,
    image: '/images/services/small_wiring.jpg'
  },
  {
    id: 'full-rewiring',
    name: 'Full house rewiring (2–3 bedroom)',
    priceRange: { min: 30000, max: 50000 },
    description: 'Complete house electrical rewiring with modern electrical systems',
    features: ['Complete rewiring', 'Modern distribution board', 'Safety upgrades', 'Warranty included'],
    duration: '3-7 days',
    premium: true,
    image: '/images/services/full_wiring.jpg'
  }
];

const features = [
  {
    icon: FaShieldAlt,
    title: 'Licensed Electricians',
    description: 'All our electricians are fully licensed, certified, and experienced professionals.'
  },
  {
    icon: FaBolt,
    title: '24/7 Emergency Service',
    description: 'Emergency electrical services available round the clock for urgent repairs.'
  },
  {
    icon: FaUsers,
    title: 'Insured & Bonded',
    description: 'Comprehensive insurance coverage and bonding for your complete peace of mind.'
  },
  {
    icon: FaCog,
    title: 'Modern Equipment',
    description: 'Latest electrical tools and equipment for precise and efficient service delivery.'
  }
];

const testimonials = [
  {
    name: 'David Kamau',
    rating: 5,
    comment: 'Excellent TV mounting service! Perfect installation with clean cable management. Very professional team.',
    service: 'TV mounting',
    image: '/images/testimonials/david.jpg'
  },
  {
    name: 'Grace Wanjiku',
    rating: 5,
    comment: 'Fast and reliable electrical inspection. Found the issue quickly and fixed it professionally.',
    service: 'Electrical inspection',
    image: '/images/testimonials/grace.jpg'
  },
  {
    name: 'John Ochieng',
    rating: 5,
    comment: 'Complete house rewiring done perfectly. Professional work with attention to safety standards.',
    service: 'Full house rewiring',
    image: '/images/testimonials/john.jpg'
  }
];

const tvSizes = [
  { size: 'Small (32" and below)', price: 'KES 2,000', multiplier: '1.0x' },
  { size: 'Medium (33"-55")', price: 'KES 3,000', multiplier: '1.5x' },
  { size: 'Large (56" and above)', price: 'KES 4,000-6,000', multiplier: '2.0x' }
];

export default function ElectricalServicesPage() {
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-yellow-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-white/10 to-yellow-300/20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-orange-300/20 to-red-300/20 blur-3xl"></div>
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
                <FaBolt className="mr-2 text-yellow-300" />
                Licensed Electrical Services
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Power Your Home{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  Safely
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-orange-100 mb-8 leading-relaxed"
              >
                Professional electrical services from licensed electricians. From TV mounting to complete rewiring, 
                we ensure your electrical systems are safe, efficient, and up to code.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="grid grid-cols-3 gap-6 mb-8"
              >
                {[
                  { number: '1000+', label: 'Projects Done' },
                  { number: '4.9', label: 'Average Rating' },
                  { number: '24/7', label: 'Emergency Service' }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-sm text-orange-200">{stat.label}</div>
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
                  href="/book-service?category=electrical"
                  className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105"
                >
                  Book Electrical Service
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaArrowRight className="ml-2" />
                  </motion.div>
                </Link>
                
                <button className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                  Emergency Service
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
                    src="/images/services/plumb.jpg"
                    alt="Professional Electrical Services"
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

      {/* Featured TV Mounting Section */}
      <section className="py-20 bg-gradient-to-br from-slate-100 to-yellow-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
            >
              <FaTv className="text-white text-3xl" />
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Professional{' '}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                TV Mounting
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Secure, professional TV mounting for all sizes with clean cable management
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {tvSizes.map((tv, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100 text-center"
              >
                <div className="text-4xl text-yellow-600 mb-4">📺</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{tv.size}</h3>
                <div className="text-2xl font-bold text-yellow-600 mb-2">{tv.price}</div>
                <div className="text-sm text-slate-500">Base price {tv.multiplier}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/book-service?service=tv-mounting&category=electrical"
              className="inline-flex items-center bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Book TV Mounting Now
              <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
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
              Our Electrical{' '}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive electrical services from licensed professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {electricalServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
                {/* Badges */}
                {service.featured && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
                    Featured
                  </div>
                )}
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
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-yellow-600 transition-colors duration-300">
                    {service.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl font-bold text-yellow-600">
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
                          className="inline-flex items-center px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs"
                        >
                          <FaCheckCircle className="mr-1 text-yellow-500" />
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
                    href={`/book-service?service=${service.id}&category=electrical`}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 rounded-2xl font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 flex items-center justify-center group-hover:shadow-lg"
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
      <section className="py-20 bg-gradient-to-br from-slate-50 to-yellow-50/30">
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
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Electrical Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Safety, quality, and professionalism in every electrical project
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
                  className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                >
                  <feature.icon className="text-white text-3xl" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors duration-300">
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
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Customers Say
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Trusted by hundreds of satisfied customers across Nairobi
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
                className="bg-gradient-to-br from-white to-yellow-50/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100/50"
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
                
                <div className="text-sm text-yellow-600 font-medium">
                  {testimonial.service}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/90 to-red-700/90"></div>
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
              <FaBolt className="text-4xl text-yellow-300" />
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need Electrical Work Done?
            </h2>
            
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Get professional electrical services from licensed electricians. Safe, reliable, and guaranteed work.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/book-service?category=electrical"
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-8 py-4 rounded-2xl text-lg font-semibold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-2xl flex items-center space-x-3 hover:scale-105"
              >
                <span>Book Electrical Service</span>
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
                <span>Emergency Service</span>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ⚡
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