'use client'

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const serviceDetails = {
  electrical: {
    name: 'Electric service',
    rating: 4.8,
    reviews: 76,
    price: '$20/Hour',
    timeStart: '7:00AM',
    timeEnd: '10:00PM',
    image: '/images/services/electrical.jpg',
    options: [
      {
        id: 'wiring',
        name: 'Wiring Installation',
        icon: '/images/services/wiring.jpg',
        description: 'Professional electrical wiring installation and setup'
      },
      {
        id: 'repairs',
        name: 'Electrical Repairs',
        icon: '/images/services/electrical-repairs.jpg',
        description: 'Fix electrical issues and faulty wiring'
      },
      {
        id: 'lighting',
        name: 'Indoor Lighting Installation',
        icon: '/images/services/lighting.jpg',
        description: 'Install and setup indoor lighting systems'
      }
    ]
  },
  plumbing: {
    name: 'Plumbing service',
    rating: 4.7,
    reviews: 89,
    price: '$18/Hour',
    timeStart: '7:00AM',
    timeEnd: '8:00PM',
    image: '/images/services/plumbing.jpg',
    options: [
      {
        id: 'installation',
        name: 'Pipe Installation',
        icon: '/images/services/pipe.jpg',
        description: 'New pipe installation and setup'
      },
      {
        id: 'repairs',
        name: 'Plumbing Repairs',
        icon: '/images/services/plumb-repair.jpg',
        description: 'Fix leaks and plumbing issues'
      },
      {
        id: 'maintenance',
        name: 'Drain Cleaning',
        icon: '/images/services/drain.jpg',
        description: 'Professional drain cleaning service'
      }
    ]
  },
  cleaning: {
    name: 'Cleaning service',
    rating: 4.6,
    reviews: 124,
    price: '$15/Hour',
    timeStart: '6:00AM',
    timeEnd: '9:00PM',
    image: '/images/services/cleaning.jpg',
    options: [
      {
        id: 'deep',
        name: 'Deep Cleaning',
        icon: '/images/services/deep-clean.jpg',
        description: 'Comprehensive deep cleaning service'
      },
      {
        id: 'regular',
        name: 'Regular Cleaning',
        icon: '/images/services/regular-clean.jpg',
        description: 'Standard home cleaning service'
      },
      {
        id: 'carpet',
        name: 'Carpet Cleaning',
        icon: '/images/services/carpet.jpg',
        description: 'Professional carpet cleaning'
      }
    ]
  }
};

export default function ServiceBookingPage() {
  const params = useParams();
  const serviceKey = params.service as keyof typeof serviceDetails;
  const service = serviceDetails[serviceKey];

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-orange-600 hover:text-orange-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-orange-600">{service.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="font-bold text-gray-900">{service.rating}</span>
                  <span className="text-gray-500">({service.reviews})</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">{service.price}</div>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{service.timeStart}</span>
                <span>To</span>
                <span className="font-medium">{service.timeEnd}</span>
              </div>
            </div>
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Service Options */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">For what you need {service.name.replace(' service', 'ian')}</h3>
          <div className="space-y-4">
            {service.options.map((option) => (
              <Link
                key={option.id}
                href={`/booking/${serviceKey}/${option.id}`}
                className="block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 p-4 border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                      <img src={option.icon} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{option.name}</h4>
                      <p className="text-gray-600 text-sm">{option.description}</p>
                    </div>
                  </div>
                  <div className="bg-orange-600 text-white p-2 rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
