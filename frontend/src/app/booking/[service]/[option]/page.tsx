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

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceKey = params.service as string;
  const optionKey = params.option as string;
  
  const [materialIncluded, setMaterialIncluded] = useState('not-included');
  const [instructions, setInstructions] = useState('');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const serviceCategory = serviceOptionsDetails[serviceKey as keyof typeof serviceOptionsDetails];
  const serviceOption = serviceCategory?.[optionKey as keyof typeof serviceCategory];

  if (!serviceOption) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service option not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/booking/${serviceKey}`} className="text-orange-600 hover:text-orange-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-orange-600">{serviceOption.name}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{serviceOption.name}</h2>
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
              <img src={serviceOption.image} alt={serviceOption.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Service Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Type</span>
                <span className="font-semibold text-gray-900">{serviceOption.type}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold text-gray-900">{serviceOption.price}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Material</span>
                <span className="font-semibold text-gray-900">
                  {materialIncluded === 'included' ? 'Included' : 'Not Included'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Traveling</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
            </div>

            {/* Material Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Options</h3>
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="material"
                    value="not-included"
                    checked={materialIncluded === 'not-included'}
                    onChange={(e) => setMaterialIncluded(e.target.value)}
                    className="mr-3 text-orange-600"
                  />
                  <span className="text-gray-700">Material not included</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="material"
                    value="included"
                    checked={materialIncluded === 'included'}
                    onChange={(e) => setMaterialIncluded(e.target.value)}
                    className="mr-3 text-orange-600"
                  />
                  <span className="text-gray-700">Include materials (+$50)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Provide Specific Instructions or Details</h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Write here..."
            rows={6}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Picture of the place</h3>
          
          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <div className="text-orange-600 text-4xl mb-4">+</div>
                <div className="text-orange-600 font-semibold text-lg">Upload</div>
                <div className="text-gray-500 text-sm mt-2">Click to select images</div>
              </div>
            </label>
          </div>

          {/* Preview Uploaded Images */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {uploadedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <div className="flex justify-center">
          <Link
            href={`/booking/${serviceKey}/${optionKey}/location`}
            className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
