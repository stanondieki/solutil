'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                <Image 
                  src="/images/logo.jpg" 
                  alt="Solutil Logo" 
                  width={80}
                  height={80}
                  className="rounded-xl object-cover shadow-lg mr-4"
                />
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                    Services Made
                    <span className="text-blue-600 block">Simple</span>
                  </h1>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Professional home services you can trust. From plumbing to painting, 
                electrical to cleaning - we connect you with vetted professionals for all your home needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/login" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Started
                </Link>
                <Link 
                  href="/services" 
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                >
                  View Services
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-100 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🔧</div>
                    <div className="font-semibold text-gray-800">Plumbing</div>
                  </div>
                  <div className="bg-yellow-100 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="font-semibold text-gray-800">Electrical</div>
                  </div>
                  <div className="bg-green-100 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🧹</div>
                    <div className="font-semibold text-gray-800">Cleaning</div>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">
                    <div className="text-3xl mb-2">🔨</div>
                    <div className="font-semibold text-gray-800">Carpentry</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Professional Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🔧', title: 'Plumbing', desc: 'Expert plumbing repairs and installations', color: 'blue' },
              { icon: '⚡', title: 'Electrical', desc: 'Safe and reliable electrical work', color: 'yellow' },
              { icon: '🧹', title: 'Cleaning', desc: 'Professional home and office cleaning', color: 'green' },
              { icon: '🔨', title: 'Carpentry', desc: 'Custom woodwork and repairs', color: 'purple' },
              { icon: '🎨', title: 'Painting', desc: 'Interior and exterior painting services', color: 'pink' },
              { icon: '🔧', title: 'Maintenance', desc: 'Regular home maintenance services', color: 'indigo' }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 border border-gray-100">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <Link 
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center"
                >
                  Get Started →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Solutil?</h2>
            <p className="text-xl text-gray-600">We make home services simple, reliable, and transparent</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vetted Professionals</h3>
              <p className="text-gray-600">All our service providers are thoroughly vetted and background checked</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600">Fast booking and quick response times for urgent service needs</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">No hidden fees. Clear pricing before any work begins</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join Solutil today and experience the difference</p>
          <Link 
            href="/login"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            Sign Up Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
