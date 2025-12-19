'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaChevronDown, FaChevronUp, FaCopy, FaCheck } from 'react-icons/fa'

interface Deal {
  code: string
  discount: string
  description: string
  validUntil: string
}

const HOLIDAY_DEALS: Deal[] = [
  { code: 'CHRISTMAS25', discount: '25% OFF', description: 'All services', validUntil: 'Dec 25' },
  { code: 'NEWYEAR2026', discount: '20% OFF', description: 'New Year special', validUntil: 'Jan 7' },
  { code: 'HOLIDAY15', discount: '15% OFF', description: 'Holiday season', validUntil: 'Jan 5' },
]

export default function FestivePromoBanner() {
  const [showDeals, setShowDeals] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <motion.div
      layout
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl"
    >
      {/* Main Banner */}
      <div className="relative px-8 py-6 md:px-12 md:py-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-white mb-2"
            >
              🎄 Holiday Season Special! 🎅
            </motion.h2>
            <p className="text-white/90 mb-4 text-lg">
              Get amazing discounts on all services this festive season!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex items-center bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Browse Services
                <FaArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <button
                onClick={() => setShowDeals(!showDeals)}
                className="inline-flex items-center bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                View Deals
                {showDeals ? (
                  <FaChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <FaChevronDown className="ml-2 h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="hidden md:block flex-shrink-0 ml-8">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            >
              <span className="text-5xl">🎁</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Expandable Deals Section */}
      <AnimatePresence>
        {showDeals && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-6 md:px-12 md:pb-8">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {HOLIDAY_DEALS.map((deal) => (
                    <motion.div
                      key={deal.code}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                    >
                      <div>
                        <p className="text-white font-bold">{deal.discount}</p>
                        <p className="text-white/70 text-sm">{deal.description}</p>
                        <p className="text-white/50 text-xs">Valid till {deal.validUntil}</p>
                      </div>
                      <button
                        onClick={() => copyCode(deal.code)}
                        className="flex items-center gap-1 bg-white text-orange-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-orange-50 transition-colors"
                      >
                        {copiedCode === deal.code ? (
                          <>
                            <FaCheck className="h-3 w-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <FaCopy className="h-3 w-3" />
                            <span>{deal.code}</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
