'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FaTools, 
  FaPlug, 
  FaWrench, 
  FaBroom, 
  FaHammer, 
  FaPaintRoller, 
  FaLeaf,
  FaFire,
  FaHome,
  FaCog,
  FaArrowRight
} from 'react-icons/fa';

interface ServiceCategory {
  key: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    key: 'electrical',
    name: 'Electrical Services',
    description: 'Professional electrical installations, repairs, and maintenance',
    icon: <FaPlug className="text-2xl" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    key: 'plumbing',
    name: 'Plumbing Services', 
    description: 'Expert plumbing repairs, installations, and emergency services',
    icon: <FaWrench className="text-2xl" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    key: 'cleaning',
    name: 'Cleaning Services',
    description: 'Professional home and office cleaning services',
    icon: <FaBroom className="text-2xl" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    key: 'carpentry',
    name: 'Carpentry Services',
    description: 'Custom woodwork, furniture repair, and carpentry projects',
    icon: <FaHammer className="text-2xl" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    key: 'painting',
    name: 'Painting Services',
    description: 'Interior and exterior painting by professional painters',
    icon: <FaPaintRoller className="text-2xl" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    key: 'gardening',
    name: 'Gardening Services',
    description: 'Landscaping, garden maintenance, and outdoor services',
    icon: <FaLeaf className="text-2xl" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  },
  {
    key: 'hvac',
    name: 'HVAC Services',
    description: 'Heating, ventilation, and air conditioning services',
    icon: <FaFire className="text-2xl" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    key: 'appliance-repair',
    name: 'Appliance Repair',
    description: 'Professional repair services for home appliances',
    icon: <FaCog className="text-2xl" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
];

export default function BookingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(serviceCategories);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = serviceCategories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(serviceCategories);
    }
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Book a <span className="text-orange-600">Service</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Find and book trusted professionals for all your home service needs. 
              From electrical work to cleaning services, we've got you covered.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto mb-12"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
              />
              <FaTools className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={`/booking/${category.key}`}>
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 p-6 cursor-pointer group hover:scale-105">
                  
                  {/* Icon */}
                  <div className={`${category.bgColor} ${category.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">Browse Services</span>
                    <FaArrowRight className="text-orange-600 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FaTools className="text-gray-400 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Services Found</h3>
            <p className="text-gray-600 mb-6">Try searching with different keywords.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Show All Services
            </button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Can't find what you need?</h2>
          <p className="text-lg mb-6 text-orange-100">
            Contact us directly and we'll help you find the right professional for your specific needs.
          </p>
          <Link
            href="/contact"
            className="bg-white text-orange-600 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors inline-flex items-center space-x-2"
          >
            <span>Contact Us</span>
            <FaArrowRight />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}