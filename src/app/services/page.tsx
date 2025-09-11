'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaWrench, 
  FaLightbulb, 
  FaShower, 
  FaPaintRoller, 
  FaBroom,
  FaCheck,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';

const services = [
  {
    id: 'plumbing',
    title: 'Plumbing Services',
    icon: FaWrench,
    description: 'Professional plumbing services for homes and businesses',
    price: 'From KES 1,500',
    color: 'bg-blue-500',
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
    icon: FaLightbulb,
    description: 'Safe and reliable electrical installations and repairs',
    price: 'From KES 2,000',
    color: 'bg-yellow-500',
    features: [
      'Wiring installation and repair',
      'Light fixture installation',
      'Socket and switch installation',
      'Electrical panel upgrades',
      'Power outlet installation',
      'Electrical safety inspections'
    ],
    duration: '2-4 hours',
    warranty: '12 months warranty'
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    icon: FaBroom,
    description: 'Deep cleaning services for spotless spaces',
    price: 'From KES 1,000',
    color: 'bg-green-500',
    features: [
      'Deep house cleaning',
      'Office cleaning',
      'Window cleaning',
      'Carpet cleaning',
      'Move-in/move-out cleaning',
      'Post-construction cleanup'
    ],
    duration: '2-6 hours',
    warranty: 'Satisfaction guarantee'
  },
  {
    id: 'carpentry',
    title: 'Carpentry Services',
    icon: FaShower,
    description: 'Custom woodwork and furniture solutions',
    price: 'From KES 2,500',
    color: 'bg-amber-600',
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
    icon: FaPaintRoller,
    description: 'Interior and exterior painting services',
    price: 'From KES 1,800',
    color: 'bg-purple-500',
    features: [
      'Interior wall painting',
      'Exterior house painting',
      'Ceiling painting',
      'Fence and gate painting',
      'Color consultation',
      'Surface preparation and priming'
    ],
    duration: '1-3 days',
    warranty: '24 months warranty'
  }
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
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
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Professional home services across Plumbing, Electrical, Cleaning, Carpentry, and Painting.
              All services come with transparent pricing and quality guarantees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center`}>
                      <service.icon className="text-white text-2xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {service.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {service.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {service.price}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">What&apos;s Included:</h4>
                    <ul className="space-y-2">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <FaCheck className="text-green-500 text-sm flex-shrink-0" />
                          <span className="text-slate-600 dark:text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-blue-600 dark:text-blue-400 text-sm cursor-pointer hover:underline"
                            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}>
                          {selectedService === service.id ? 'Show less' : `+${service.features.length - 3} more`}
                        </li>
                      )}
                    </ul>
                    
                    {selectedService === service.id && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 mt-2"
                      >
                        {service.features.slice(3).map((feature, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <FaCheck className="text-green-500 text-sm flex-shrink-0" />
                            <span className="text-slate-600 dark:text-slate-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <FaClock className="text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Duration</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{service.duration}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaShieldAlt className="text-green-600" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">Warranty</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{service.warranty}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/booking?service=${service.id}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    Book {service.title}
                  </Link>
                  
                  <button className="border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium">
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Solutil?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We make professional home services simple, reliable, and affordable
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Vetted Professionals</h3>
              <p className="text-slate-600 dark:text-slate-300">
                All our service providers are background-checked, insured, and highly skilled
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Quality Guarantee</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We stand behind our work with comprehensive warranties and satisfaction guarantees
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaClock className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">On-Time Service</h3>
              <p className="text-slate-600 dark:text-slate-300">
                We respect your time and always arrive when scheduled, ready to work
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Book Your Service?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get started with professional, reliable service today
            </p>
            
            <Link
              href="/booking"
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book a Service Now
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
