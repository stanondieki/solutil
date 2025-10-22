'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaBug, FaShieldAlt, FaClock, FaCheck, FaSprayCan, FaHome, FaPhone, FaArrowRight } from 'react-icons/fa';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';

const fumigationServices = [
  {
    id: 'pest-control',
    name: 'General Pest Control',
    description: 'Comprehensive pest elimination for homes and offices',
    price: 'KES 3,000 - 8,000',
    duration: '2-4 hours',
    features: [
      'Complete property inspection',
      'Targeted pest treatment',
      'Safe, eco-friendly chemicals',
      'Follow-up service included',
      'Child & pet safe products'
    ],
    popular: true
  },
  {
    id: 'termite-control',
    name: 'Termite Control',
    description: 'Professional termite elimination and prevention',
    price: 'KES 5,000 - 15,000',
    duration: '3-6 hours',
    features: [
      'Termite colony elimination',
      'Wood treatment & protection',
      'Soil barrier application',
      'Long-term prevention plan',
      '2-year warranty included'
    ]
  },
  {
    id: 'rodent-control',
    name: 'Rodent Control',
    description: 'Effective mice and rat elimination services',
    price: 'KES 2,500 - 6,000',
    duration: '1-3 hours',
    features: [
      'Entry point identification',
      'Safe baiting systems',
      'Humane trapping methods',
      'Sanitation recommendations',
      'Prevention advice included'
    ]
  },
  {
    id: 'cockroach-control',
    name: 'Cockroach Control',
    description: 'Complete cockroach elimination and prevention',
    price: 'KES 2,000 - 5,000',
    duration: '1-2 hours',
    features: [
      'Gel baiting treatment',
      'Crack & crevice treatment',
      'Kitchen area focus',
      'Bathroom sanitization',
      'Monthly follow-up available'
    ]
  },
  {
    id: 'bed-bug-control',
    name: 'Bed Bug Control',
    description: 'Professional bed bug elimination service',
    price: 'KES 4,000 - 10,000',
    duration: '2-4 hours',
    features: [
      'Heat treatment available',
      'Mattress & furniture treatment',
      'Steam cleaning service',
      'Inspection & monitoring',
      'Guarantee on effectiveness'
    ]
  },
  {
    id: 'ant-control',
    name: 'Ant Control',
    description: 'Targeted ant colony elimination',
    price: 'KES 1,500 - 4,000',
    duration: '1-2 hours',
    features: [
      'Colony source identification',
      'Barrier spray treatment',
      'Bait station placement',
      'Garden area treatment',
      'Prevention maintenance'
    ]
  }
];

const features = [
  {
    title: 'Licensed Professionals',
    description: 'All our fumigation experts are certified and licensed',
    icon: FaShieldAlt
  },
  {
    title: 'Safe Chemicals',
    description: 'We use only approved, eco-friendly pest control products',
    icon: FaSprayCan
  },
  {
    title: 'Guaranteed Results',
    description: 'We guarantee effective pest elimination or we return',
    icon: FaCheck
  },
  {
    title: 'Emergency Service',
    description: '24/7 emergency pest control service available',
    icon: FaClock
  }
];

const testimonials = [
  {
    name: 'David Mwangi',
    location: 'Westlands, Nairobi',
    rating: 5,
    comment: 'Excellent termite control service! My house is now completely pest-free. Very professional team.'
  },
  {
    name: 'Grace Wanjiku',
    location: 'Karen, Nairobi',
    rating: 5,
    comment: 'Best pest control service in Nairobi. They eliminated all cockroaches from my restaurant kitchen.'
  },
  {
    name: 'Peter Kimani',
    location: 'Kiambu',
    rating: 5,
    comment: 'Professional bed bug treatment. No more sleepless nights! Highly recommend their services.'
  }
];

export default function FumigationServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/20">
      <Navigation />

      {/* Hero Section */}
      <section className="py-28 lg:py-40 bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/30 to-emerald-400/30 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-teal-400/30 to-green-400/30 blur-3xl"></div>
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
              <FaBug className="text-green-400 text-xl mr-3" />
              <span className="text-white font-semibold">Professional Pest Control</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight"
            >
              Fumigation &{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Pest Control
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Professional pest elimination services using safe, effective methods. Protect your home or business from unwanted pests with our guaranteed solutions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/book-service?category=fumigation"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold text-lg shadow-xl flex items-center space-x-2"
              >
                <span>Book Fumigation Service</span>
                <FaArrowRight />
              </Link>
              
              <Link
                href="tel:+254712345678"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 font-bold text-lg border border-white/20 flex items-center space-x-2"
              >
                <FaPhone />
                <span>Emergency: +254 712 345 678</span>
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
                <div className="text-3xl font-black text-green-400 mb-2">500+</div>
                <div className="text-green-100 text-sm">Properties Treated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">99%</div>
                <div className="text-green-100 text-sm">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-green-400 mb-2">24/7</div>
                <div className="text-green-100 text-sm">Emergency Service</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Fumigation Services Grid */}
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
              Our Fumigation{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive pest control solutions tailored to eliminate specific pest problems in your home or business
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fumigationServices.map((service, index) => (
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
                  <div className="absolute -top-3 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                    Most Popular
                  </div>
                )}
                
                <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-green-200 h-full">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                      <FaBug className="text-white text-2xl" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-600">{service.price}</div>
                      <div className="text-sm text-slate-500">{service.duration}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{service.name}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCheck className="text-white text-xs" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href={`/book-service?service=${service.id}`}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold shadow-lg block"
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
      <section className="py-20 bg-gradient-to-br from-slate-50 to-green-50/30">
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
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Pest Control?
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
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
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full mr-1"></div>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-green-600 text-sm">{testimonial.location}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900 via-emerald-800 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8">
              Ready to Eliminate Pests?
            </h2>
            <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto">
              Don't let pests invade your space. Contact us today for professional, guaranteed pest control services.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/book-service?category=fumigation"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-5 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-bold text-xl shadow-xl"
              >
                Book Fumigation Service Now
              </Link>
              
              <Link
                href="tel:+254712345678"
                className="bg-white/10 backdrop-blur-sm text-white px-10 py-5 rounded-2xl hover:bg-white/20 transition-all duration-300 font-bold text-xl border border-white/20 flex items-center space-x-3"
              >
                <FaPhone />
                <span>Call for Emergency Service</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}