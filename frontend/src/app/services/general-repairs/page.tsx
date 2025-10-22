'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaTools, FaShieldAlt, FaClock, FaCheck, FaWrench, FaHome, FaPhone, FaArrowRight, FaStar } from 'react-icons/fa';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';

const repairServices = [
  {
    id: 'door-repair',
    name: 'Door Repair & Installation',
    description: 'Professional door repair, adjustment, and installation services',
    price: 'KES 2,000 - 8,000',
    duration: '1-4 hours',
    features: [
      'Door alignment & adjustment',
      'Lock mechanism repair',
      'Hinge replacement',
      'Door frame repair',
      'New door installation'
    ],
    popular: true
  },
  {
    id: 'window-repair',
    name: 'Window Repair & Maintenance',
    description: 'Complete window repair and maintenance services',
    price: 'KES 1,500 - 6,000',
    duration: '1-3 hours',
    features: [
      'Window frame repair',
      'Glass replacement',
      'Lock & handle repair',
      'Weatherstripping replacement',
      'Window reglazing'
    ]
  },
  {
    id: 'wall-repair',
    name: 'Wall Repair & Patching',
    description: 'Expert wall repair, patching, and restoration',
    price: 'KES 1,000 - 5,000',
    duration: '2-4 hours',
    features: [
      'Crack repair & sealing',
      'Hole patching & filling',
      'Surface preparation',
      'Primer & paint touch-up',
      'Texture matching'
    ]
  },
  {
    id: 'ceiling-repair',
    name: 'Ceiling Repair & Maintenance',
    description: 'Professional ceiling repair and restoration services',
    price: 'KES 2,500 - 10,000',
    duration: '2-6 hours',
    features: [
      'Water damage repair',
      'Crack sealing',
      'Ceiling panel replacement',
      'Paint & finish restoration',
      'Insulation repair'
    ]
  },
  {
    id: 'floor-repair',
    name: 'Floor Repair & Restoration',
    description: 'Complete floor repair and restoration services',
    price: 'KES 3,000 - 15,000',
    duration: '2-8 hours',
    features: [
      'Tile replacement & repair',
      'Wood floor restoration',
      'Concrete crack repair',
      'Leveling & smoothing',
      'Protective coating application'
    ]
  },
  {
    id: 'furniture-repair',
    name: 'Furniture Repair & Restoration',
    description: 'Expert furniture repair and restoration services',
    price: 'KES 1,500 - 8,000',
    duration: '1-4 hours',
    features: [
      'Joint tightening & repair',
      'Surface refinishing',
      'Hardware replacement',
      'Upholstery repair',
      'Structural reinforcement'
    ]
  }
];

const features = [
  {
    title: 'Expert Craftsmen',
    description: 'Skilled professionals with years of repair experience',
    icon: FaWrench
  },
  {
    title: 'Quality Materials',
    description: 'We use only high-quality, durable repair materials',
    icon: FaShieldAlt
  },
  {
    title: 'Quick Response',
    description: 'Fast response times for urgent repair needs',
    icon: FaClock
  },
  {
    title: 'Satisfaction Guarantee',
    description: 'We guarantee your satisfaction with every repair job',
    icon: FaCheck
  }
];

const testimonials = [
  {
    name: 'Mary Njoroge',
    location: 'Kilimani, Nairobi',
    rating: 5,
    comment: 'Excellent door repair service! My door now opens and closes perfectly. Very professional team.'
  },
  {
    name: 'James Ochieng',
    location: 'Kasarani, Nairobi',
    rating: 5,
    comment: 'Great ceiling repair work. They fixed the water damage perfectly and even repainted to match.'
  },
  {
    name: 'Susan Wambui',
    location: 'Lavington, Nairobi',
    rating: 5,
    comment: 'Professional furniture repair service. My dining table looks brand new! Highly recommend.'
  }
];

export default function GeneralRepairsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      <Navigation />

      {/* Hero Section */}
      <section className="py-28 lg:py-40 bg-gradient-to-br from-slate-900 via-gray-800 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-orange-400/30 to-red-400/30 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-purple-400/30 to-orange-400/30 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8"
            >
              <FaTools className="text-orange-400 text-xl mr-3" />
              <span className="text-white font-semibold">Professional Repair Services</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight"
            >
              General{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Repairs
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Professional repair services for your home and office. From doors and windows to walls and furniture - we fix it all with expertise and care.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/book-service?category=general-repairs"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl flex items-center space-x-2"
              >
                <span>Book Repair Service</span>
                <FaArrowRight />
              </Link>
              
              <Link
                href="tel:+254712345678"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-bold text-lg border border-white/20 flex items-center space-x-2"
              >
                <FaPhone />
                <span>Call: +254 712 345 678</span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400 mb-2">1000+</div>
                <div className="text-gray-200 text-sm">Repairs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400 mb-2">98%</div>
                <div className="text-gray-200 text-sm">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-orange-400 mb-2">24h</div>
                <div className="text-gray-200 text-sm">Response Time</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Repair Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Our Repair{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive repair solutions for your home and office maintenance needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repairServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                {service.popular && (
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                    Most Popular
                  </div>
                )}
                
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-orange-200 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                      <FaTools className="text-white text-2xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-orange-600">{service.price}</div>
                      <div className="text-sm text-slate-500">{service.duration}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCheck className="text-white text-xs" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={`/book-service?service=${service.id}`}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-center px-6 py-4 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg block"
                  >
                    Book {service.name}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-orange-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Why Choose Our{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Repair Services?
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
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
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Client{' '}
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-500 mr-1" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-orange-600 text-sm">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-gray-800 to-orange-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8">
              Need Something Fixed?
            </h2>
            <p className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
              Don't let small problems become big ones. Contact us today for professional repair services you can trust.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/book-service?category=general-repairs"
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-10 py-5 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-bold text-xl shadow-xl"
              >
                Book Repair Service Now
              </Link>
              
              <Link
                href="tel:+254712345678"
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl hover:bg-white/20 transition-all duration-300 font-bold text-xl border border-white/20 flex items-center space-x-3"
              >
                <FaPhone />
                <span>Call for Quote</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}