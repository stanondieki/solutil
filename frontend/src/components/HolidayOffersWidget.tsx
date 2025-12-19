'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaGift, FaClock, FaStar, FaCopy, FaCheck, FaChevronRight } from 'react-icons/fa'

interface HolidayOffer {
  id: string
  code: string
  title: string
  description: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minOrder?: number
  validUntil: string
  category?: string // 'all' | 'cleaning' | 'electrical' | 'plumbing' etc
  isActive: boolean
  usageLimit?: number
  usedCount?: number
}

// Default festive offers - can be fetched from backend
const DEFAULT_OFFERS: HolidayOffer[] = [
  {
    id: '1',
    code: 'CHRISTMAS25',
    title: '🎄 Christmas Special',
    description: '25% off all services this Christmas!',
    discount: 25,
    discountType: 'percentage',
    validUntil: '2025-12-25',
    category: 'all',
    isActive: true
  },
  {
    id: '2',
    code: 'NEWYEAR2026',
    title: '🎆 New Year Special',
    description: '20% off to start 2026 right!',
    discount: 20,
    discountType: 'percentage',
    validUntil: '2026-01-07',
    category: 'all',
    isActive: true
  },
  {
    id: '3',
    code: 'CLEANHOLIDAY',
    title: '🧹 Holiday Clean-Up',
    description: 'KES 500 off cleaning services for the holidays!',
    discount: 500,
    discountType: 'fixed',
    minOrder: 2000,
    validUntil: '2025-12-31',
    category: 'cleaning',
    isActive: true
  },
  {
    id: '4',
    code: 'FESTIVEFIX',
    title: '⚡ Festive Fix Special',
    description: '15% off electrical & plumbing repairs!',
    discount: 15,
    discountType: 'percentage',
    validUntil: '2025-12-31',
    category: 'electrical',
    isActive: true
  }
]

interface HolidayOffersWidgetProps {
  variant?: 'compact' | 'full' | 'card'
  maxOffers?: number
  onSelectOffer?: (offer: HolidayOffer) => void
}

export default function HolidayOffersWidget({ 
  variant = 'card',
  maxOffers = 4,
  onSelectOffer 
}: HolidayOffersWidgetProps) {
  const [offers, setOffers] = useState<HolidayOffer[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<HolidayOffer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        // Try fetching from API first
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const response = await fetch(`${API_URL}/api/discounts/festive`)
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.length > 0) {
            // Transform API data to HolidayOffer format
            const apiOffers: HolidayOffer[] = data.data.map((offer: any, index: number) => ({
              id: offer._id || String(index + 1),
              code: offer.code,
              title: offer.discountType === 'percentage' 
                ? `🎄 ${offer.discountValue}% OFF`
                : `🎁 KES ${offer.discountValue} OFF`,
              description: offer.description,
              discount: offer.discountValue,
              discountType: offer.discountType,
              minOrder: offer.minOrderAmount,
              validUntil: offer.validUntil,
              category: 'all',
              isActive: true
            }))
            setOffers(apiOffers.slice(0, maxOffers))
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error('Error fetching festive offers:', error)
      }
      
      // Fallback to default offers
      const activeOffers = DEFAULT_OFFERS
        .filter(offer => {
          const validDate = new Date(offer.validUntil)
          return offer.isActive && validDate >= new Date()
        })
        .slice(0, maxOffers)
      
      setOffers(activeOffers)
      setLoading(false)
    }
    
    fetchOffers()
  }, [maxOffers])

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getTimeRemaining = (validUntil: string) => {
    const end = new Date(validUntil)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    if (hours > 0) return `${hours}h left`
    return 'Ending soon!'
  }

  if (loading) {
    // Show minimal loading state
    if (variant === 'compact') return null
    return (
      <div className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 rounded-2xl p-6 border border-red-500/30 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-700 rounded"></div>
          <div className="h-16 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (offers.length === 0) return null

  // Compact variant - single line for headers
  if (variant === 'compact') {
    return (
      <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-green-500 text-white px-4 py-2 rounded-lg">
        <FaGift className="h-5 w-5" />
        <span className="font-medium">Use code</span>
        <button
          onClick={() => copyCode(offers[0].code)}
          className="bg-white text-red-600 px-2 py-0.5 rounded font-bold text-sm hover:bg-yellow-100"
        >
          {copiedCode === offers[0].code ? '✓ Copied!' : offers[0].code}
        </button>
        <span>for {offers[0].discount}{offers[0].discountType === 'percentage' ? '%' : ' KES'} off!</span>
      </div>
    )
  }

  // Full variant - detailed list
  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 rounded-2xl p-6 border border-red-500/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-green-500 rounded-xl flex items-center justify-center">
              <FaGift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">🎄 Holiday Offers</h3>
              <p className="text-gray-400 text-sm">Special discounts for the festive season</p>
            </div>
          </div>
          <FaStar className="h-8 w-8 text-yellow-400 animate-pulse" />
        </div>

        <div className="space-y-4">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-800/50 rounded-xl p-4 border ${
                selectedOffer?.id === offer.id ? 'border-orange-500' : 'border-gray-700'
              } hover:border-orange-500/50 transition-colors cursor-pointer`}
              onClick={() => {
                setSelectedOffer(offer)
                onSelectOffer?.(offer)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-white font-semibold">{offer.title}</h4>
                    {offer.category && offer.category !== 'all' && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        {offer.category}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{offer.description}</p>
                  
                  <div className="flex items-center space-x-4 mt-3">
                    <div className="flex items-center space-x-1 text-orange-400">
                      <FaClock className="h-4 w-4" />
                      <span className="text-sm">{getTimeRemaining(offer.validUntil)}</span>
                    </div>
                    {offer.minOrder && (
                      <span className="text-gray-500 text-sm">
                        Min order: KES {offer.minOrder.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-2xl font-bold text-green-400">
                    {offer.discountType === 'percentage' ? `${offer.discount}%` : `KES ${offer.discount}`}
                    <span className="text-sm font-normal text-gray-400 ml-1">OFF</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyCode(offer.code)
                    }}
                    className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <FaCheck className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <FaCopy className="h-4 w-4" />
                        <span>{offer.code}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Festive decoration */}
        <div className="flex justify-center mt-6 space-x-2 text-2xl">
          <span>🎄</span>
          <span>🎁</span>
          <span>⭐</span>
          <span>🎅</span>
          <span>❄️</span>
        </div>
      </div>
    )
  }

  // Card variant - dashboard widget style
  return (
    <div className="bg-gradient-to-br from-red-900/30 to-green-900/30 rounded-xl p-4 border border-red-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaGift className="h-5 w-5 text-red-400" />
          <h3 className="text-white font-semibold">Holiday Offers</h3>
        </div>
        <span className="text-2xl animate-bounce">🎄</span>
      </div>

      <div className="space-y-2">
        {offers.slice(0, 2).map((offer) => (
          <div
            key={offer.id}
            className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
          >
            <div>
              <p className="text-white text-sm font-medium">{offer.title}</p>
              <p className="text-gray-400 text-xs">{getTimeRemaining(offer.validUntil)}</p>
            </div>
            <button
              onClick={() => copyCode(offer.code)}
              className="text-orange-400 hover:text-orange-300 text-sm font-bold"
            >
              {copiedCode === offer.code ? '✓' : offer.code}
            </button>
          </div>
        ))}
      </div>

      <button className="w-full mt-3 text-center text-orange-400 hover:text-orange-300 text-sm flex items-center justify-center">
        View all offers <FaChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// Hook to apply discount to a price
export function useHolidayDiscount() {
  const applyDiscount = (
    originalPrice: number, 
    discountCode: string,
    category?: string
  ): { 
    finalPrice: number
    savings: number
    applied: boolean
    error?: string 
  } => {
    const offer = DEFAULT_OFFERS.find(o => o.code === discountCode.toUpperCase())
    
    if (!offer) {
      return { finalPrice: originalPrice, savings: 0, applied: false, error: 'Invalid discount code' }
    }

    // Check if offer is still valid
    if (new Date(offer.validUntil) < new Date()) {
      return { finalPrice: originalPrice, savings: 0, applied: false, error: 'This offer has expired' }
    }

    // Check category restriction
    if (offer.category && offer.category !== 'all' && offer.category !== category) {
      return { finalPrice: originalPrice, savings: 0, applied: false, error: `This code is only valid for ${offer.category} services` }
    }

    // Check minimum order
    if (offer.minOrder && originalPrice < offer.minOrder) {
      return { finalPrice: originalPrice, savings: 0, applied: false, error: `Minimum order of KES ${offer.minOrder} required` }
    }

    // Calculate discount
    let savings = 0
    if (offer.discountType === 'percentage') {
      savings = Math.round(originalPrice * (offer.discount / 100))
    } else {
      savings = offer.discount
    }

    const finalPrice = Math.max(0, originalPrice - savings)

    return { finalPrice, savings, applied: true }
  }

  return { applyDiscount, offers: DEFAULT_OFFERS }
}
