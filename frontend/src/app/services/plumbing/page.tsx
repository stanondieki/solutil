'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import { 
  FaWrench,
  FaTools,
  FaClock,
  FaStar,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaTint,
  FaHome,
  FaUsers
} from 'react-icons/fa';

const plumbingServices = [
  {
    id: 'pipe-repair',
    name: 'Pipe repair and replacement',
    priceRange: { min: 1500, max: 5000 },
    description: 'Professional pipe repair and replacement services for all types of plumbing issues',
    features: ['Leak detection', 'Pipe replacement', 'Water damage prevention', 'Quality materials'],
    duration: '1-4 hours',
    popular: true,
    image: '/images/services/pipe-repair.jpg'
  },
  {
    id: 'toilet-repair',
    name: 'Toilet repair and installation',
    priceRange: { min: 2000, max: 6000 },
    description: 'Complete toilet repair and installation services with quality fixtures',
    features: ['Toilet installation', 'Repair services', 'Modern fixtures', 'Water efficiency'],
    duration: '2-4 hours',
    popular: true,
    image: '/images/services/toilet-repair.jpg'
  },
  {
    id: 'faucet-installation',
    name: 'Faucet and fixture installation',
    priceRange: { min: 1000, max: 3500 },
    description: 'Installation of faucets, sinks, and other plumbing fixtures',
    features: ['Faucet installation', 'Sink mounting', 'Fixture replacement', 'Water testing'],
    duration: '1-3 hours',
    image: '/images/services/faucet-installation.jpg'
  },
  {
    id: 'drain-cleaning',
    name: 'Drain cleaning and unclogging',
    priceRange: { min: 1200, max: 3000 },
    description: 'Professional drain cleaning and unclogging services',
    features: ['Drain unclogging', 'Pipe cleaning', 'Root removal', 'Preventive maintenance'],
    duration: '1-2 hours',
    image: '/images/services/drain-cleaning.jpg'
  },
  {
    id: 'water-heater',
    name: 'Water heater service',
    priceRange: { min: 3000, max: 8000 },
    description: 'Water heater installation, repair, and maintenance services',
    features: ['Installation', 'Repair services', 'Maintenance', 'Energy efficiency'],
    duration: '2-5 hours',
    premium: true,
    image: '/images/services/water-heater.jpg'
  },
  {
    id: 'bathroom-plumbing',
    name: 'Complete bathroom plumbing',
    priceRange: { min: 8000, max: 15000 },
    description: 'Complete bathroom plumbing installation and renovation',
    features: ['Full bathroom setup', 'Modern fixtures', 'Professional installation', 'Warranty included'],
    duration: '1-3 days',
    premium: true,
    image: '/images/services/bathroom-plumbing.jpg'
  }
];

export default function PlumbingServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-white/10 to-cyan-300/20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
                <FaTint className="mr-2 text-cyan-300" />
                Professional Plumbing Services
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                Expert Plumbing{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Solutions
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-blue-100 mb-8 leading-relaxed"
              >
                From emergency repairs to complete installations, our expert plumbers deliver reliable solutions for all your plumbing needs.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/book-service?category=plumbing"
                  className="group bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105"
                >
                  Book Plumbing Service
                  <FaArrowRight className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-3xl transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <Image
                    src="/images/services/plumbing-hero.jpg"
                    alt="Professional Plumbing Services"
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
              Our Plumbing{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Comprehensive plumbing solutions for homes and businesses
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plumbingServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100"
              >
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
                    </div>
                  </div>

                  <Link
                    href={`/book-service?service=${service.id}&category=plumbing`}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center group-hover:shadow-lg"
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >            
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Need Plumbing Help?
            </h2>
            
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Get professional plumbing services from experienced technicians. Quick response and quality work guaranteed.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/book-service?category=plumbing"
                className="group bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 shadow-2xl flex items-center space-x-3 hover:scale-105"
              >
                <span>Book Plumbing Service</span>
                <FaArrowRight />
              </Link>
              
              <a
                href="tel:+254717855249"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
              >
                <span>Emergency Call</span>
                🚨
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}