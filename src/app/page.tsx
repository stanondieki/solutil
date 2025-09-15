'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    {
      image: '/images/services/plumb.jpg',
      alt: 'Professional Plumbing Services',
      title: 'Expert Plumbing',
      subtitle: 'Reliable pipe repairs, installations, and maintenance'
    },
    {
      image: '/images/services/elec.jpg', 
      alt: 'Professional Electrical Services',
      title: 'Safe Electrical Work',
      subtitle: 'Professional wiring, installations, and troubleshooting'
    },
    {
      image: '/images/services/clean.jpg',
      alt: 'Professional Cleaning Services', 
      title: 'Professional Cleaning',
      subtitle: 'Deep cleaning and maintenance for homes and offices'
    }
  ]

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 10000) // Change slide every 10 seconds

    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />

      {/* Hero Slideshow Section - First Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images with Slideshow */}
        <div className="absolute inset-0">
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div 
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center lg:text-left"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
                  Services Made
                  <span className="text-orange-400 block">Simple</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-200 mb-12">
                  Professional home services you can trust. From plumbing to electrical work, 
                  and professional cleaning - we connect you with vetted professionals for your essential home needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/auth/login"
                    className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Book a Service Now
                  </Link>
                  <Link 
                    href="/services"
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-5 rounded-lg text-xl font-semibold transition-all"
                  >
                    View Services
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20">
          <div className="flex flex-col gap-4">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-orange-600' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-8 z-20">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/80 flex flex-col items-center"
          >
            <span className="text-sm mb-2">Scroll Down</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Our Professional Services
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600">Don't just take our word for it - see what our satisfied customers have to say</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Kimani',
                location: 'Nairobi',
                service: 'Plumbing',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b002?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
                testimonial: 'Excellent service! The plumber arrived on time, fixed my kitchen sink quickly, and the pricing was very fair. I\'ll definitely use Solutil again.',
                date: '2 weeks ago'
              },
              {
                name: 'David Mwangi',
                location: 'Kiambu',
                service: 'Electrical',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
                testimonial: 'Professional electrical work! They installed new wiring in my home office safely and efficiently. Great communication throughout the process.',
                date: '1 month ago'
              },
              {
                name: 'Grace Wanjiku',
                location: 'Nakuru',
                service: 'Cleaning',
                rating: 5,
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
                testimonial: 'Amazing deep cleaning service! My house has never been cleaner. The team was thorough, professional, and respectful of my property.',
                date: '3 weeks ago'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100">
                <div className="flex items-center mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex text-orange-400 mr-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{testimonial.service} Service</span>
                </div>
                
                <blockquote className="text-gray-700 mb-4 italic">
                  "{testimonial.testimonial}"
                </blockquote>
                
                <div className="text-xs text-gray-500 border-t pt-3">
                  {testimonial.date}
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/auth/login"
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg inline-block"
            >
              Join Our Happy Customers
            </Link>
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
      <section className="py-16 bg-orange-600 opacity-90 text-white">
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
