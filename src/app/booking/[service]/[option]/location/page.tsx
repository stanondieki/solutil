'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function LocationPage() {
  const params = useParams();
  const serviceKey = params.service as string;
  const optionKey = params.option as string;
  
  const [locationPermission, setLocationPermission] = useState<string | null>(null);

  const handleLocationPermission = (permission: string) => {
    setLocationPermission(permission);
    // In a real app, you would handle location permissions here
    if (permission === 'allow-once' || permission === 'allow-while-using') {
      // Request actual location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location obtained:', position.coords);
            // Redirect to next step
            window.location.href = `/booking/${serviceKey}/${optionKey}/review`;
          },
          (error) => {
            console.error('Location error:', error);
            // Still allow to proceed
            window.location.href = `/booking/${serviceKey}/${optionKey}/review`;
          }
        );
      } else {
        // Geolocation not supported, still proceed
        window.location.href = `/booking/${serviceKey}/${optionKey}/review`;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        {/* Location Permission Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Allow "Solutil" to use your location
            </h1>
            <p className="text-gray-600 leading-relaxed">
              We need to know your exact location so that the electrician can visit you easily.
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="bg-gray-100 rounded-xl h-64 mb-8 overflow-hidden relative">
            <img 
              src="/images/map-placeholder.jpg" 
              alt="Map showing location" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full flex items-center justify-center bg-blue-100">
                    <div class="text-center">
                      <div class="text-4xl mb-2">📍</div>
                      <div class="text-gray-600">Location Map</div>
                      <div class="text-sm text-gray-500 mt-2">Tijuana and surrounding areas</div>
                    </div>
                  </div>
                `;
              }}
            />
          </div>

          {/* Permission Options */}
          <div className="space-y-4">
            <button
              onClick={() => handleLocationPermission('allow-once')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
            >
              Allow Once
            </button>

            <button
              onClick={() => handleLocationPermission('allow-while-using')}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-4 rounded-xl font-semibold text-lg transition-colors border border-orange-200"
            >
              Allow While Using Solutil
            </button>

            <button
              onClick={() => handleLocationPermission('dont-allow')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Don't Allow
            </button>
          </div>

          {/* Manual Address Option */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Prefer to enter your address manually?
            </p>
            <Link
              href={`/booking/${serviceKey}/${optionKey}/review`}
              className="text-orange-600 hover:text-orange-700 font-semibold"
            >
              Enter Address Manually
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link
            href={`/booking/${serviceKey}/${optionKey}`}
            className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Service Details
          </Link>
        </div>
      </div>
    </div>
  );
}
