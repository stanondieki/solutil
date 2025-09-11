'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaWrench, 
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaStar,
  FaPhoneAlt,
  FaCheckCircle
} from 'react-icons/fa';

const features = [
  {
    icon: FaShieldAlt,
    title: 'Trust & Safety',
    description: 'All our workers are vetted, insured, and background-checked for your peace of mind.'
  },
  {
    icon: FaClock,
    title: 'Reliable Service',
    description: 'We arrive on time and complete jobs efficiently without compromising on quality.'
  },
  {
    icon: FaUsers,
    title: 'Professional Team',
    description: 'Our skilled professionals have years of experience in their respective fields.'
  },
  {
    icon: FaStar,
    title: 'Quality Guaranteed',
    description: 'We stand behind our work with quality guarantees and customer satisfaction.'
  }
];

const values = [
  'Professional service delivery',
  'Transparent pricing with no hidden costs',
  'Emergency services available',
  'Customer satisfaction guarantee',
  'Licensed and insured professionals',
  'Modern tools and techniques'
];

export default function AboutPage() {
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
            <div className="flex items-center justify-center mb-6">
              <Image 
                src="/images/logo.jpg" 
                alt="Solutil Logo" 
                width={80}
                height={80}
                className="rounded-xl object-cover shadow-lg mr-4"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              About{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Solutil
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              Your trusted partner for professional home services in Nairobi. 
              We believe in making quality services simple, reliable, and accessible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Our Story
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                Solutil was born from a simple belief: finding reliable home services shouldn&apos;t be complicated or stressful. 
                We understand the frustration of unreliable service providers and the importance of trust when someone enters your home.
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                That&apos;s why we built Solutil - to connect you with vetted, professional service providers who share our values 
                of trust, safety, and reliability. Every professional on our platform is carefully screened and continuously monitored 
                to ensure they meet our high standards.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} className="text-yellow-400 text-lg" />
                  ))}
                </div>
                <span className="text-slate-600 dark:text-slate-300">Trusted by 1000+ happy customers</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Why Choose Solutil?</h3>
                <ul className="space-y-3">
                  {values.map((value, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <FaCheckCircle className="text-white flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
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
              What Sets Us Apart
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We&apos;ve built our platform around the values that matter most to our customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200/50 dark:border-slate-700/50"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-white text-xl" />
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
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
              Ready to Experience the Difference?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of satisfied customers who trust Solutil for their home service needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/booking"
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book a Service Now
              </Link>
              
              <a
                href="tel:+254123456789"
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2"
              >
                <FaPhoneAlt />
                <span>Call Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
