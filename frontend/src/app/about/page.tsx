'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { 
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaStar,
  FaPhoneAlt,
  FaCheckCircle,
  FaAward,
  FaHeart,
  FaLightbulb,
  FaRocket,
  FaHandshake,
  FaTools
} from 'react-icons/fa';

const features = [
  {
    icon: FaShieldAlt,
    title: 'Trust & Safety',
    description: 'All our workers are vetted, insured, and background-checked for your peace of mind.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: FaClock,
    title: 'Reliable Service',
    description: 'We arrive on time and complete jobs efficiently without compromising on quality.',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    icon: FaUsers,
    title: 'Professional Team',
    description: 'Our skilled professionals have years of experience in their respective fields.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20'
  },
  {
    icon: FaStar,
    title: 'Quality Guaranteed',
    description: 'We stand behind our work with quality guarantees and customer satisfaction.',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
  }
];

const coreValues = [
  {
    icon: FaHeart,
    title: 'Customer First',
    description: 'Every decision we make puts our customers needs and satisfaction at the center.',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: FaLightbulb,
    title: 'Innovation',
    description: 'We continuously improve our platform and services using the latest technology.',
    color: 'from-amber-500 to-orange-500'
  },
  {
    icon: FaHandshake,
    title: 'Trust',
    description: 'Building lasting relationships through transparency, reliability, and integrity.',
    color: 'from-teal-500 to-cyan-500'
  }
];

const stats = [
  { number: '1000+', label: 'Happy Customers', icon: FaUsers },
  { number: '500+', label: 'Projects Completed', icon: FaTools },
  { number: '50+', label: 'Expert Professionals', icon: FaAward },
  { number: '24/7', label: 'Support Available', icon: FaClock }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Navigation />

      {/* Hero Section */}
      <section className="py-28 lg:py-40 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 relative overflow-hidden">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight"
            >
              About{' '}
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-700 bg-clip-text text-transparent">
                Solutil
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
            >
              Your trusted partner for professional home services in Nairobi. 
              We believe in making quality services simple, reliable, and accessible to everyone.
            </motion.p>

            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50 group hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="text-white text-xl" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.number}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-800 dark:text-orange-200 text-sm font-medium mb-6"
              >
                <FaRocket className="mr-2" />
                Our Journey
              </motion.div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Building Trust Through{' '}
                <span className="bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                  Excellence
                </span>
              </h2>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Solutil was born from a simple belief: finding reliable home services shouldn&apos;t be complicated or stressful. 
                We understand the frustration of unreliable service providers and the importance of trust when someone enters your home.
              </p>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                That&apos;s why we built Solutil - to connect you with vetted, professional service providers who share our values 
                of trust, safety, and reliability. Every professional on our platform is carefully screened and continuously monitored 
                to ensure they meet our high standards.
              </p>
              
              <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: star * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <FaStar className="text-yellow-400 text-xl" />
                    </motion.div>
                  ))}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">4.9/5 Rating</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">Trusted by 1000+ happy customers</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
                className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 rounded-3xl p-8 text-white shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <FaCheckCircle className="mr-3 text-white/90" />
                    Why Choose Solutil?
                  </h3>
                  <div className="space-y-4">
                    {values.map((value, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-3 group"
                      >
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                          <FaCheckCircle className="text-white text-sm" />
                        </div>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-orange-200/20 to-pink-200/20 blur-3xl"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-200/20 to-indigo-200/20 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Team Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center px-4 py-2 bg-orange-100/10 backdrop-blur-sm rounded-full text-orange-300 text-sm font-medium mb-6"
              >
                <FaUsers className="mr-2" />
                Meet Our Team
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-3xl lg:text-4xl font-bold text-white mb-6"
              >
                Passionate Professionals{' '}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Delivering Excellence
                </span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-slate-300 text-lg leading-relaxed mb-8"
              >
                Our diverse team of skilled professionals brings years of experience and dedication to every project. 
                From certified technicians to customer service specialists, we're committed to providing exceptional 
                service that exceeds your expectations.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">50+</div>
                  <div className="text-slate-300 text-sm">Expert Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">10+</div>
                  <div className="text-slate-300 text-sm">Years Combined Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">98%</div>
                  <div className="text-slate-300 text-sm">Customer Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                  <div className="text-slate-300 text-sm">Support Available</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Team Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative">
                {/* Team Image */}
                <div className="relative bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden relative">
                    <Image 
                      src="/images/solutilteam.jpg" 
                      alt="SoluTil Connect Team - Professional service providers"
                      fill
                      className="object-cover rounded-2xl hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-20"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium mb-6"
            >
              <FaLightbulb className="mr-2" />
              What Sets Us Apart
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Excellence in Every{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Detail
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              We&apos;ve built our platform around the values that matter most to our customers
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
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className={`absolute inset-0 ${feature.bgColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  {/* Floating gradient orb */}
                  <div className={`absolute top-4 right-4 w-20 h-20 bg-gradient-to-r ${feature.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 group-hover:animate-pulse`}></div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <feature.icon className="text-white text-2xl" />
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.color} w-0 group-hover:w-full transition-all duration-500`}></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-800 dark:text-purple-200 text-sm font-medium mb-6"
            >
              <FaHeart className="mr-2" />
              Our Core Values
            </motion.div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              The Foundation of Our{' '}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Success
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              These values guide every decision we make and every interaction we have
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  {/* Animated background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  
                  {/* Floating particles effect */}
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
                    <div className={`absolute top-4 left-4 w-2 h-2 bg-gradient-to-r ${value.color} rounded-full opacity-30 group-hover:animate-bounce`}></div>
                    <div className={`absolute top-8 right-8 w-1 h-1 bg-gradient-to-r ${value.color} rounded-full opacity-40 group-hover:animate-ping`} style={{ animationDelay: '0.5s' }}></div>
                    <div className={`absolute bottom-6 left-8 w-1.5 h-1.5 bg-gradient-to-r ${value.color} rounded-full opacity-35 group-hover:animate-pulse`} style={{ animationDelay: '1s' }}></div>
                  </div>
                  
                  <div className="relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ duration: 0.3 }}
                      className={`w-20 h-20 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-xl mx-auto group-hover:shadow-2xl transition-shadow duration-300`}
                    >
                      <value.icon className="text-white text-3xl" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 text-center group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                      {value.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-center group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors duration-300">
                      {value.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/5 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <FaRocket className="text-4xl text-white" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold mb-4"
            >
              Ready to Experience the Difference?
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-xl mb-8 opacity-90 max-w-2xl mx-auto"
            >
              Join thousands of satisfied customers who trust Solutil for their home service needs
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/services/all"
                  className="group bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-100 transition-all duration-300 shadow-2xl flex items-center space-x-3"
                >
                  <span>Book a Service Now</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaRocket className="text-orange-600 group-hover:text-orange-700" />
                  </motion.div>
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="tel:+254717855249"
                  className="group border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaPhoneAlt />
                  </motion.div>
                  <span>Call Us Now</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/80"
            >
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-xl" />
                <span className="text-sm">Insured & Bonded</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-xl" />
                <span className="text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaStar className="text-xl text-yellow-300" />
                <span className="text-sm">4.9/5 Rating</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
