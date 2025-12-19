'use client'

import React from 'react'
import Image from 'next/image'

interface SantaAvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showHat?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const hatSizes = {
  sm: 'w-5 h-5 -top-2 -right-1',
  md: 'w-6 h-6 -top-2 -right-1',
  lg: 'w-7 h-7 -top-3 -right-1',
  xl: 'w-9 h-9 -top-3 -right-1'
}

export default function SantaAvatar({ 
  src, 
  name = 'User', 
  size = 'md',
  className = '',
  showHat = true 
}: SantaAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Check if it's festive season (December or first week of January)
  const now = new Date()
  const isFestiveSeason = now.getMonth() === 11 || (now.getMonth() === 0 && now.getDate() <= 7)
  
  const shouldShowHat = showHat && isFestiveSeason

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center`}>
        {src ? (
          <Image
            src={src}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`text-white font-bold ${size === 'xl' ? 'text-xl' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
            {initials}
          </span>
        )}
      </div>

      {/* Santa Hat Overlay */}
      {shouldShowHat && (
        <div className={`absolute ${hatSizes[size]} pointer-events-none`}>
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-12">
            {/* Hat base */}
            <ellipse cx="50" cy="85" rx="45" ry="12" fill="#fff" />
            {/* Hat main body */}
            <path
              d="M15 85 Q20 30 50 15 Q80 30 85 85 Z"
              fill="#c41e3a"
            />
            {/* White trim */}
            <ellipse cx="50" cy="85" rx="42" ry="8" fill="#fff" />
            {/* Pompom */}
            <circle cx="50" cy="12" r="10" fill="#fff" />
            {/* Shading */}
            <path
              d="M30 85 Q35 40 50 25 Q50 40 45 85 Z"
              fill="rgba(0,0,0,0.1)"
            />
          </svg>
        </div>
      )}
    </div>
  )
}

// Wrapper for existing avatars - just adds the hat
export function SantaHatOverlay({ 
  children, 
  size = 'md' 
}: { 
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' 
}) {
  const now = new Date()
  const isFestiveSeason = now.getMonth() === 11 || (now.getMonth() === 0 && now.getDate() <= 7)

  if (!isFestiveSeason) return <>{children}</>

  return (
    <div className="relative inline-block">
      {children}
      <div className={`absolute ${hatSizes[size]} pointer-events-none`}>
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-12">
          <ellipse cx="50" cy="85" rx="45" ry="12" fill="#fff" />
          <path d="M15 85 Q20 30 50 15 Q80 30 85 85 Z" fill="#c41e3a" />
          <ellipse cx="50" cy="85" rx="42" ry="8" fill="#fff" />
          <circle cx="50" cy="12" r="10" fill="#fff" />
          <path d="M30 85 Q35 40 50 25 Q50 40 45 85 Z" fill="rgba(0,0,0,0.1)" />
        </svg>
      </div>
    </div>
  )
}
