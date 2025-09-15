'use client'

import React from 'react'
import Link from 'next/link'
import { FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaStar } from 'react-icons/fa'

export default function BookingsPage() {
  const mockBookings = [
    {
      id: '1',
      service: 'Plumbing',
      provider: 'John Kamau',
      date: '2024-09-20',
      time: '10:00 AM',
      status: 'Confirmed',
      location: 'Nairobi, Kenya',
      price: 'KSh 2,500'
    },
    {
      id: '2',
      service: 'Electrical',
      provider: 'Sarah Wanjiku',
      date: '2024-09-18',
      time: '2:00 PM',
      status: 'Completed',
      location: 'Nairobi, Kenya',
      price: 'KSh 3,000'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="mr-4 p-2 hover:bg-orange-100 rounded-lg transition-colors">
            <FaArrowLeft className="text-orange-600" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {mockBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{booking.service}</h3>
                  <p className="text-gray-600">with {booking.provider}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                  booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <FaCalendarAlt className="text-orange-500" />
                  <span className="text-sm text-gray-600">{booking.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaClock className="text-orange-500" />
                  <span className="text-sm text-gray-600">{booking.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-orange-500" />
                  <span className="text-sm text-gray-600">{booking.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{booking.price}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  View Details
                </button>
                {booking.status === 'Completed' && (
                  <button className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors">
                    <FaStar className="text-sm" />
                    <span>Rate Service</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {mockBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-orange-500 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start by booking your first service!</p>
            <Link href="/dashboard" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
