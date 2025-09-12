'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-6">
                {/* <Image 
                  src="/images/logo.jpg" 
                  alt="Solutil Logo" 
                  width={80}
                  height={80}
                  className="rounded-xl object-cover shadow-lg mr-4"
                /> */}
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                    Services Made
                    <span className="text-orange-600 block">Simple</span>
                  </h1>
                </div>
              </div>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Professional home services you can trust. From plumbing to painting, 
                electrical to cleaning - we connect you with vetted professionals for all your home needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  href="/auth/login" 
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  Book a Service Now
                </Link>
                <Link 
                  href="/services" 
                  className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 hover:text-white transition-all"
                >
                  View Services
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform  hover:rotate-0 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-xl text-center group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden">
                      <Image 
                        src="/images/services/plumbing.jpg"
                        alt="Plumbing"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">Plumbing</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl text-center group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden">
                      <Image 
                        src="/images/services/electrical.jpg"
                        alt="Electrical"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">Electrical</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-3 rounded-xl text-center group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden">
                      <Image 
                        src="/images/services/cleaning.jpg"
                        alt="Cleaning"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">Cleaning</div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-xl text-center group cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative w-12 h-12 mx-auto mb-2 rounded-lg overflow-hidden">
                      <Image 
                        src="/images/services/carpentry.jpg"
                        alt="Carpentry"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">Carpentry</div>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                image: '/images/services/plumbing.jpg', 
                title: 'Plumbing', 
                desc: 'Expert plumbing repairs and installations', 
                features: ['Pipe repairs', 'Drain cleaning', 'Water heater service'],
                color: 'orange',
                price: 'From KES 1,500'
              },
              { 
                image: '/images/services/electrical.jpg', 
                title: 'Electrical', 
                desc: 'Safe and reliable electrical work', 
                features: ['Wiring installation', 'Circuit repairs', 'Lighting setup'],
                color: 'gray',
                price: 'From KES 2,000'
              },
              { 
                image: '/images/services/cleaning.jpg', 
                title: 'Cleaning', 
                desc: 'Professional home and office cleaning', 
                features: ['Deep cleaning', 'Regular maintenance', 'Move-in/out cleaning'],
                color: 'orange',
                price: 'From KES 1,000'
              },
              { 
                image: '/images/services/carpentry.jpg', 
                title: 'Carpentry', 
                desc: 'Custom woodwork and repairs', 
                features: ['Furniture repair', 'Custom cabinets', 'Door installation'],
                color: 'gray',
                price: 'From KES 2,500'
              }
            ].map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image 
                    src={service.image}
                    alt={`${service.title} Service`}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {service.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{service.desc}</p>
                  <ul className="space-y-1 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/auth/login"
                    className={`w-full block text-center py-3 px-4 bg-gradient-to-r from-${service.color}-600 to-${service.color}-700 text-white rounded-lg hover:from-${service.color}-700 hover:to-${service.color}-800 transition-all font-semibold transform hover:scale-105 shadow-md`}
                  >
                    Book Now →
                  </Link>
                </div>
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
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vetted Professionals</h3>
              <p className="text-gray-600">All our service providers are thoroughly vetted and background checked</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Response</h3>
              <p className="text-gray-600">Fast booking and quick response times for urgent service needs</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-16 bg-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Book your service today and experience the Solutil difference</p>
          <Link 
            href="/auth/login"
            className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg inline-block"
          >
            Book Service Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
