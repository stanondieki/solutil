'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaCheck,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaAward
} from 'react-icons/fa';

const services = [
  {
    id: 'plumbing',
    title: 'Plumbing Services',
    image: '/servicetools/plumbtools.png',
    description: 'Professional plumbing services for homes and businesses',
    price: 'From KES 2,000',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-50 to-blue-100',
    features: [
      'Pipe installation and repair',
      'Drain cleaning and unclogging',
      'Water heater installation',
      'Bathroom and kitchen plumbing',
      'Emergency leak repairs',
      'Toilet installation and repair'
    ],
    duration: '1-3 hours',
    warranty: '6 months warranty'
  },
  {
    id: 'electrical',
    title: 'Electrical Services',
    image: '/servicetools/electricityicon.png',
    description: 'Safe and reliable electrical installations and repairs',
    price: 'From KES 2,000',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-50 to-orange-100',
    features: [
      'Wiring installation and repair',
      'Light fixture installation',
      'Socket and switch installation',
      'Electrical panel upgrades',
      'Emergency electrical repairs',
      'Security lighting installation'
    ],
    duration: '2-4 hours',
    warranty: '12 months warranty'
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    image: '/servicetools/cleantools.png',
    description: 'Comprehensive cleaning services for your space',
    price: 'From KES 1,800',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-100',
    features: [
      'Deep house cleaning',
      'Office cleaning services',
      'Carpet and upholstery cleaning',
      'Window cleaning',
      'Post-construction cleanup',
      'Regular maintenance cleaning'
    ],
    duration: '2-6 hours',
    warranty: 'Satisfaction guarantee'
  },
  {
    id: 'carpentry',
    title: 'Carpentry Services',
    image: '/servicetools/carpentrytools.png',
    description: 'Custom woodwork and furniture solutions',
    price: 'From KES 2,500',
    color: 'from-amber-600 to-orange-600',
    bgColor: 'from-amber-50 to-orange-100',
    features: [
      'Custom furniture building',
      'Kitchen cabinet installation',
      'Shelving and storage solutions',
      'Door and window installation',
      'Flooring installation',
      'Furniture repair and restoration'
    ],
    duration: '4-8 hours',
    warranty: '12 months warranty'
  },
  {
    id: 'painting',
    title: 'Painting Services',
    image: '/servicetools/painting.png',
    description: 'Interior and exterior painting services',
    price: 'From KES 2,000',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-50 to-pink-100',
    features: [
      'Interior wall painting',
      'Exterior house painting',
      'Ceiling painting',
      'Decorative finishes',
      'Color consultation',
      'Surface preparation and priming'
    ],
    duration: '1-3 days',
    warranty: '24 months warranty'
  },
  {
    id: 'movers',
    title: 'Moving Services',
    image: '/servicetools/movers1.png',
    description: 'Professional moving and relocation services',
    price: 'From KES 3,000',
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'from-teal-50 to-cyan-100',
    features: [
      'Residential moving services',
      'Office relocation',
      'Packing and unpacking',
      'Furniture disassembly/assembly',
      'Loading and unloading',
      'Storage solutions'
    ],
    duration: '4-8 hours',
    warranty: 'Items protection guarantee'
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

      {/* Services Grid */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-gray-200 relative">
                  {/* Service Image Header */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <Image 
                      src={service.image} 
                      alt={service.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-500 p-4"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent`}></div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                            {service.title}
                          </h3>
                          <p className="text-white/90 text-xs font-medium drop-shadow">
                            {service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-400 drop-shadow-lg">
                            {service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="font-black text-slate-900 mb-4 text-lg">What's Included:</h4>
                        <ul className="space-y-4">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center space-x-4">
                              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaCheck className="text-white text-sm" />
                              </div>
                              <span className="text-slate-800 text-lg font-medium">{feature}</span>
                            </li>
                          ))}
                          {service.features.length > 3 && (
                            <li className="text-orange-600 text-base cursor-pointer hover:underline font-bold"
                                onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}>
                              {selectedService === service.id ? 'Show less' : `+${service.features.length - 3} more services`}
                            </li>
                          )}
                        </ul>
                        
                        {selectedService === service.id && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 mt-4"
                          >
                            {service.features.slice(3).map((feature, idx) => (
                              <li key={idx} className="flex items-center space-x-4">
                                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <FaCheck className="text-white text-sm" />
                                </div>
                                <span className="text-slate-800 text-base font-medium">{feature}</span>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </div>

                      <div className="space-y-8">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl flex items-center justify-center">
                            <FaClock className="text-white text-xl" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-lg mb-2">Duration</div>
                            <div className="text-base text-slate-700 font-medium">{service.duration}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                            <FaShieldAlt className="text-white text-xl" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-lg mb-2">Warranty</div>
                            <div className="text-base text-slate-700 font-medium">{service.warranty}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5">
                      <Link
                        href={`/booking?service=${service.title.toLowerCase()}`}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 font-black text-lg shadow-xl"
                      >
                        Book {service.title}
                      </Link>
                      
                      <button className="border-2 border-slate-300 text-slate-800 px-6 py-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 font-black text-lg hover:border-orange-500 hover:text-orange-600 shadow-lg">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
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