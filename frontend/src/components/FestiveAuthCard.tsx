'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface FestiveAuthCardProps {
  children: React.ReactNode
}

// Check if festive season (Dec 1 - Jan 5)
const isFestiveSeason = (): boolean => {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()
  return month === 11 || (month === 0 && day <= 5)
}

export default function FestiveAuthCard({ children }: FestiveAuthCardProps) {
  const showFestive = isFestiveSeason()

  if (!showFestive) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Santa Hat image on top-right corner of the card */}
      <motion.div
        initial={{ rotate: 25, opacity: 0, y: -10 }}
        animate={{ rotate: 20, opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
        className="absolute -top-10 -right-4 z-10"
      >
        <Image
          src="/images/santa-hat.png"
          alt="Santa Hat"
          width={70}
          height={55}
          className="drop-shadow-lg"
          style={{ transform: 'scaleX(-1)' }}
        />
      </motion.div>

      {/* The actual card content */}
      {children}

      {/* Subtle festive message at bottom */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center text-gray-400 text-xs mt-4"
      >
        🎄 Happy Holidays from Solutil! 🎄
      </motion.p>
    </div>
  )
}
