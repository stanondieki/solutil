'use client'

import { useState, useEffect } from 'react'

interface CookieConsent {
  accepted: boolean
  settings: {
    essential: boolean
    analytics: boolean
    marketing: boolean
    preferences: boolean
  }
  timestamp: string
}

export function useLegalNotice() {
  const [showLegalNotice, setShowLegalNotice] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem('solutil_cookie_consent')
        if (!consent) {
          // No consent found, show popup
          setShowLegalNotice(true)
        } else {
          const consentData: CookieConsent = JSON.parse(consent)
          const consentDate = new Date(consentData.timestamp)
          const now = new Date()
          const daysSinceConsent = (now.getTime() - consentDate.getTime()) / (1000 * 3600 * 24)
          
          // Re-ask for consent every 365 days
          if (daysSinceConsent > 365) {
            setShowLegalNotice(true)
          }
        }
      } catch (error) {
        console.error('Error checking consent:', error)
        setShowLegalNotice(true)
      }
      setIsLoaded(true)
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(checkConsent, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    setShowLegalNotice(false)
  }

  const handleDecline = () => {
    setShowLegalNotice(false)
  }

  return {
    showLegalNotice,
    isLoaded,
    handleAccept,
    handleDecline
  }
}

export function getCookieConsent(): CookieConsent | null {
  try {
    const consent = localStorage.getItem('solutil_cookie_consent')
    return consent ? JSON.parse(consent) : null
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(): boolean {
  const consent = getCookieConsent()
  return consent?.settings?.analytics || false
}

export function hasMarketingConsent(): boolean {
  const consent = getCookieConsent()
  return consent?.settings?.marketing || false
}

export function hasPreferencesConsent(): boolean {
  const consent = getCookieConsent()
  return consent?.settings?.preferences || false
}