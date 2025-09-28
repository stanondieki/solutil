'use client'

import React from 'react'
import { useLegalNotice } from '@/hooks/useLegalNotice'
import LegalNoticePopup from '@/components/LegalNoticePopup'

export default function LegalNoticeWrapper() {
  const { showLegalNotice, isLoaded, handleAccept, handleDecline } = useLegalNotice()

  // Don't render anything until we've checked localStorage
  if (!isLoaded) return null

  return (
    <LegalNoticePopup
      isOpen={showLegalNotice}
      onAccept={handleAccept}
      onDecline={handleDecline}
    />
  )
}