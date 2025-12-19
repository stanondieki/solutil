'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaGift, FaStar } from 'react-icons/fa'
import { GiPartyPopper } from 'react-icons/gi'

interface FestiveOffer {
  id: string
  code: string
  discount: number
  description: string
  validUntil: string
  type: 'percentage' | 'fixed'
}

const FESTIVE_OFFERS: FestiveOffer[] = [
  {
    id: 'christmas25',
    code: 'CHRISTMAS25',
    discount: 25,
    description: 'Christmas Special - 25% off all services!',
    validUntil: '2025-12-25',
    type: 'percentage'
  },
  {
    id: 'newyear2026',
    code: 'NEWYEAR2026',
    discount: 20,
    description: 'New Year Special - 20% off your first booking in 2026!',
    validUntil: '2026-01-07',
    type: 'percentage'
  },
  {
    id: 'holiday500',
    code: 'HOLIDAY500',
    discount: 500,
    description: 'Get KES 500 off on bookings above KES 3,000!',
    validUntil: '2025-12-31',
    type: 'fixed'
  }
]

export default function FestiveBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const [daysUntilChristmas, setDaysUntilChristmas] = useState(0)

  useEffect(() => {
    // Check if banner was dismissed today
    const dismissedDate = localStorage.getItem('festiveBannerDismissed')
    const today = new Date().toDateString()
    if (dismissedDate === today) {
      setIsVisible(false)
    }

    // Calculate days until Christmas
    const christmas = new Date('2025-12-25')
    const now = new Date()
    const diffTime = christmas.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysUntilChristmas(Math.max(0, diffDays))

    // Rotate offers every 5 seconds
    const interval = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % FESTIVE_OFFERS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('festiveBannerDismissed', new Date().toDateString())
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentOffer = FESTIVE_OFFERS[currentOfferIndex]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative overflow-hidden"
      >
        {/* Festive gradient background */}
        <div className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 bg-[length:200%_100%] animate-gradient">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Left: Decorative elements */}
              <div className="flex items-center space-x-2">
                <motion.span
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  🎄
                </motion.span>
                
                {daysUntilChristmas > 0 && (
                  <div className="hidden sm:flex items-center bg-white/20 rounded-full px-3 py-1">
                    <FaStar className="h-4 w-4 text-yellow-300 mr-1" />
                    <span className="text-white text-sm font-medium">
                      {daysUntilChristmas} days to Christmas!
                    </span>
                  </div>
                )}
              </div>

              {/* Center: Rotating offers */}
              <motion.div
                key={currentOffer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex items-center justify-center space-x-3"
              >
                <FaGift className="h-5 w-5 text-yellow-300" />
                <span className="text-white font-medium text-sm sm:text-base">
                  {currentOffer.description}
                </span>
                <button
                  onClick={() => copyCode(currentOffer.code)}
                  className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold hover:bg-yellow-100 transition-colors flex items-center space-x-1"
                >
                  <span>{copied ? '✓ Copied!' : currentOffer.code}</span>
                </button>
              </motion.div>

              {/* Right: Dismiss button */}
              <div className="flex items-center space-x-2">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl"
                >
                  🎅
                </motion.span>
                <button
                  onClick={handleDismiss}
                  className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Offer dots indicator */}
            <div className="flex justify-center space-x-1 mt-2">
              {FESTIVE_OFFERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentOfferIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentOfferIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Decorative snow/sparkle overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/30 text-xs"
              initial={{ 
                top: -10,
                left: `${Math.random() * 100}%`
              }}
              animate={{
                top: '100%',
                rotate: 360
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'linear'
              }}
            >
              ❄
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Add this to your global CSS for the gradient animation
// @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
// .animate-gradient { animation: gradient 3s ease infinite; }
