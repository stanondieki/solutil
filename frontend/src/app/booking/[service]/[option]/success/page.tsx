'use client'

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SuccessPage() {
  const params = useParams();
  const serviceKey = params.service as string;
  const optionKey = params.option as string;

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order received</h1>
          <p className="text-gray-600 leading-relaxed">
            Your order for the service of Electrician has received, The service Provider will arrived at 10:00AM.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold">Wiring Installation</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">December 23, 2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">10:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Provider:</span>
              <span className="font-semibold">Will be assigned shortly</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200 block"
          >
            Home
          </Link>
          
          <Link
            href="/bookings"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors block"
          >
            View My Bookings
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            You will receive a confirmation SMS and email shortly. The service provider will contact you 30 minutes before arrival.
          </p>
        </div>
      </div>
    </div>
  );
}
