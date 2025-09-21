'use client'

import React, { useState } from 'react';
import Link from 'next/link';

const allServices = [
  {
    category: 'Maintenance & Repair',
    icon: '🔧',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    services: [
      { name: 'Air Conditioning', icon: '/images/services/air-condition.jpg', rating: 4.8, startingPrice: 'KES 2,500', description: 'AC installation, repair & maintenance' },
      { name: 'Electrical Work', icon: '/images/services/electrical.jpg', rating: 4.9, startingPrice: 'KES 2,200', description: 'Wiring, fixtures & electrical repairs' },
      { name: 'Siding Repair', icon: '/images/services/siding-repair.jpg', rating: 4.6, startingPrice: 'KES 3,000', description: 'Exterior siding installation & repair' },
    ],
  },
  {
    category: 'Cleaning Services',
    icon: '🧹',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    services: [
      { name: 'Home Flooring', icon: '/images/services/home-flooring.jpg', rating: 4.7, startingPrice: 'KES 1,800', description: 'Floor cleaning & maintenance' },
      { name: 'Gutter Cleaning', icon: '/images/services/gutter.jpg', rating: 4.5, startingPrice: 'KES 2,000', description: 'Gutter cleaning & repair services' },
      { name: 'Carpet Cleaning', icon: '/images/services/carpet.jpg', rating: 4.8, startingPrice: 'KES 1,500', description: 'Deep carpet cleaning & stain removal' },
    ],
  },
  {
    category: 'Home Improvement',
    icon: '🏠',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    services: [
      { name: 'Drilling Services', icon: '/images/services/drill.jpg', rating: 4.6, startingPrice: 'KES 1,200', description: 'Professional drilling & mounting' },
      { name: 'Lawn Care', icon: '/images/services/lawn-mower.jpg', rating: 4.7, startingPrice: 'KES 2,500', description: 'Lawn mowing & garden maintenance' },
      { name: 'Landscaping', icon: '/images/services/plant.jpg', rating: 4.9, startingPrice: 'KES 3,500', description: 'Garden design & plant installation' },
    ],
  },
  {
    category: 'Painting Services',
    icon: '🎨',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    services: [
      { name: 'Interior Painting', icon: '/images/services/interior.jpg', rating: 4.8, startingPrice: 'KES 4,000', description: 'Professional interior painting' },
      { name: 'Exterior Painting', icon: '/images/services/exterior.jpg', rating: 4.7, startingPrice: 'KES 5,000', description: 'Weather-resistant exterior painting' },
      { name: 'Wall Treatments', icon: '/images/services/wall.jpg', rating: 4.6, startingPrice: 'KES 3,000', description: 'Wallpaper & special wall finishes' },
    ],
  },
  {
    category: 'Other Services',
    icon: '⚡',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    services: [
      { name: 'Dishwashing', icon: '/images/services/dish-wash.jpg', rating: 4.5, startingPrice: 'KES 800', description: 'Professional dishwashing service' },
      { name: 'Moving & Loading', icon: '/images/services/loading.jpg', rating: 4.7, startingPrice: 'KES 3,500', description: 'Furniture moving & loading services' },
      { name: 'Cutting Services', icon: '/images/services/cutting.jpg', rating: 4.4, startingPrice: 'KES 1,500', description: 'Material cutting & shaping' },
    ],
  },
];

export default function AllServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...allServices.map(group => group.category)];

  const filteredServices = allServices.filter(group => 
    selectedCategory === 'All' || group.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">All Services</h1>
            <p className="text-xl text-gray-600 mb-8">Professional services for your home and business needs</p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 shadow-sm'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredServices.map((group, idx) => (
          <div key={group.category} className="mb-12">
            {/* Category Header */}
            <div className={`${group.bgColor} rounded-2xl p-6 mb-6 border-l-4 border-${group.color.split('-')[1]}-500`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${group.color} flex items-center justify-center text-2xl text-white shadow-lg`}>
                  {group.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{group.category}</h2>
                  <p className="text-gray-600">{group.services.length} services available</p>
                </div>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.services.map((service, serviceIdx) => (
                <div 
                  key={service.name}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={service.icon} 
                      alt={service.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="font-semibold text-gray-900 text-sm">{service.rating}</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Available
                    </div>
                  </div>
                  
                  {/* Service Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${group.color} flex items-center justify-center text-white text-xs`}>
                          {group.icon}
                        </div>
                        <span className={`${group.textColor} font-medium text-sm`}>Starting at</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{service.startingPrice}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/booking/${service.name.toLowerCase()}`}
                        className={`flex-1 bg-gradient-to-r ${group.color} text-white py-3 px-4 rounded-xl font-semibold shadow-md transform hover:scale-105 transition-all duration-200 text-center`}
                      >
                        Book Now
                      </Link>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors">
                        Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl shadow-xl p-8 text-center text-white mt-16">
          <h2 className="text-3xl font-bold mb-4">Don't See What You Need?</h2>
          <p className="text-blue-100 mb-6 text-lg">Tell us what service you're looking for and we'll find the right professional for you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
              Request Custom Service
            </button>
            <Link 
              href="/dashboard" 
              className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors border-2 border-blue-400"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
