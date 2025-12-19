'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface FestiveCountdownProps {
  targetDate?: string // ISO date string
  title?: string
  compact?: boolean
}

export default function FestiveCountdown({ 
  targetDate = '2025-12-25T00:00:00',
  title = 'Christmas',
  compact = false
}: FestiveCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  if (!isClient) return null

  // If countdown is over
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-gradient-to-r from-red-600 to-green-600 rounded-xl p-4 text-center"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-4xl mb-2"
        >
          🎄🎅🎁
        </motion.div>
        <h3 className="text-white text-xl font-bold">Merry {title}!</h3>
        <p className="text-white/80 text-sm">Wishing you joy and happiness!</p>
      </motion.div>
    )
  }

  // Compact version for headers/navbars
  if (compact) {
    return (
      <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-green-500/20 rounded-lg px-3 py-1.5">
        <span className="text-lg">🎄</span>
        <span className="text-white text-sm">
          <span className="font-bold">{timeLeft.days}</span>d{' '}
          <span className="font-bold">{timeLeft.hours}</span>h{' '}
          <span className="font-bold">{timeLeft.minutes}</span>m to {title}
        </span>
      </div>
    )
  }

  // Full countdown widget
  return (
    <div className="bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 rounded-2xl p-6 border border-red-500/30 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -left-4 text-6xl opacity-10">🎄</div>
        <div className="absolute -bottom-4 -right-4 text-6xl opacity-10">🎅</div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-center mb-4">
          <motion.span 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl inline-block"
          >
            🎄
          </motion.span>
          <h3 className="text-white text-lg font-bold mt-2">Countdown to {title}</h3>
        </div>

        {/* Countdown boxes */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Mins', value: timeLeft.minutes },
            { label: 'Secs', value: timeLeft.seconds }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-xl p-3 text-center border border-gray-700"
            >
              <motion.div 
                key={item.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-white"
              >
                {String(item.value).padStart(2, '0')}
              </motion.div>
              <div className="text-xs text-gray-400 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Festive message */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            {timeLeft.days > 7 
              ? "Book your holiday services early! 🎁"
              : timeLeft.days > 1 
                ? "Last chance for pre-holiday bookings! ⚡"
                : "It's almost here! 🎉"}
          </p>
        </div>

        {/* Decorative icons */}
        <div className="flex justify-center space-x-2 mt-4 text-xl">
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }}>⭐</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>🎁</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>🔔</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}>❄️</motion.span>
          <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.8 }}>🎅</motion.span>
        </div>
      </div>
    </div>
  )
}

// New Year countdown variant
export function NewYearCountdown() {
  return (
    <FestiveCountdown 
      targetDate="2026-01-01T00:00:00" 
      title="New Year 2026"
    />
  )
}
