'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Snowflake {
  id: number
  x: number
  delay: number
  duration: number
  size: number
  opacity: number
}

export default function SnowfallEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Check user preference
    const snowDisabled = localStorage.getItem('snowfallDisabled') === 'true'
    setIsEnabled(!snowDisabled)

    if (snowDisabled) return

    // Generate snowflakes
    const flakes: Snowflake[] = []
    for (let i = 0; i < 50; i++) {
      flakes.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 10,
        duration: 10 + Math.random() * 20,
        size: 4 + Math.random() * 8,
        opacity: 0.3 + Math.random() * 0.5
      })
    }
    setSnowflakes(flakes)
  }, [])

  if (!isEnabled || snowflakes.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white select-none"
          style={{
            left: `${flake.x}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            textShadow: '0 0 5px rgba(255,255,255,0.5)'
          }}
          initial={{ top: -20, rotate: 0 }}
          animate={{
            top: '105vh',
            rotate: 360,
            x: [0, 30, -30, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear',
            x: {
              duration: flake.duration / 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
        >
          ❄
        </motion.div>
      ))}

      {/* Toggle button */}
      <button
        onClick={() => {
          const newState = !isEnabled
          setIsEnabled(newState)
          localStorage.setItem('snowfallDisabled', String(!newState))
        }}
        className="fixed bottom-4 left-4 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/20 transition-colors pointer-events-auto z-50"
        title={isEnabled ? 'Disable snow effect' : 'Enable snow effect'}
      >
        {isEnabled ? '❄️' : '☀️'}
      </button>
    </div>
  )
}
