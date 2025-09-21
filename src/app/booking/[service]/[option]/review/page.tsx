'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ServiceOption {
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
}

const serviceOptionsDetails: Record<string, Record<string, ServiceOption>> = {
  electrical: {
    wiring: {
      name: 'Wiring Installation',
      type: 'Electrician',
      price: '$20/H',
      image: '/images/services/wiring.jpg',
      description: 'Professional electrical wiring installation and setup'
    },
    repairs: {
      name: 'Electrical Repairs',
      type: 'Electrician', 
      price: '$25/H',
      image: '/images/services/electrical-repairs.jpg',
      description: 'Fix electrical issues and faulty wiring'
    },
    lighting: {
      name: 'Indoor Lighting Installation',
      type: 'Electrician',
      price: '$22/H',
      image: '/images/services/lighting.jpg',
      description: 'Install and setup indoor lighting systems'
    }
  },
  plumbing: {
    installation: {
      name: 'Pipe Installation',
      type: 'Plumber',
      price: '$18/H',
      image: '/images/services/pipe.jpg',
      description: 'New pipe installation and setup'
    },
    repairs: {
      name: 'Plumbing Repairs',
      type: 'Plumber',
      price: '$20/H', 
      image: '/images/services/plumb-repair.jpg',
      description: 'Fix leaks and plumbing issues'
    },
    maintenance: {
      name: 'Drain Cleaning',
      type: 'Plumber',
      price: '$15/H',
      image: '/images/services/drain.jpg',
      description: 'Professional drain cleaning service'
    }
  },
  cleaning: {
    deep: {
      name: 'Deep Cleaning',
      type: 'Cleaner',
      price: '$18/H',
      image: '/images/services/deep-clean.jpg',
      description: 'Comprehensive deep cleaning service'
    },
    regular: {
      name: 'Regular Cleaning', 
      type: 'Cleaner',
      price: '$15/H',
      image: '/images/services/regular-clean.jpg',
      description: 'Standard home cleaning service'
    },
    carpet: {
      name: 'Carpet Cleaning',
      type: 'Cleaner',
      price: '$16/H',
      image: '/images/services/carpet.jpg',
      description: 'Professional carpet cleaning'
    }
  }
};

export default function ReviewPage() {
  const params = useParams();
  const serviceKey = params.service as string;
  const optionKey = params.option as string;
  
  const [selectedDate, setSelectedDate] = useState('December 23, 2023');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [address, setAddress] = useState('Street no. 23 Ouch west road\nAlibagh, Alibagh, Ouch, 18750,\nKenya');

  const serviceCategory = serviceOptionsDetails[serviceKey];
  const serviceOption = serviceCategory?.[optionKey];

  if (!serviceOption) {
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
            <Link href={`/booking/${serviceKey}/${optionKey}/location`} className="text-orange-600 hover:text-orange-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Review Summary</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">{serviceOption.name}</h2>
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
              <img src={serviceOption.image} alt={serviceOption.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className="font-semibold text-gray-900">{serviceOption.type}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-900">{serviceOption.price}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Material</span>
                <span className="font-semibold text-gray-900">Not Included</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Traveling</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Service Address</h3>
              <div className="text-gray-600 whitespace-pre-line">{address}</div>
            </div>
            <button className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
              Edit
            </button>
          </div>
        </div>

        {/* Date & Time Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Date</h3>
              <div className="space-y-3">
                <input
                  type="date"
                  value="2023-12-23"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <div className="text-sm text-gray-600">Selected: {selectedDate}</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Time</h3>
              <div className="space-y-3">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
                <div className="text-sm text-gray-600">Selected: {selectedTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-orange-600">{serviceOption.price}</span>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Final price will be calculated based on actual hours worked
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <Link
            href={`/booking/${serviceKey}/${optionKey}/success`}
            className="w-full max-w-md bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-center"
          >
            Confirm
          </Link>
        </div>
      </div>
    </div>
  );
}
