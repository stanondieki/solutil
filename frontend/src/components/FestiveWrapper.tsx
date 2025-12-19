'use client';

import React, { useState, useEffect } from 'react';
import FestiveBanner from './FestiveBanner';
import SnowfallEffect from './SnowfallEffect';

interface FestiveWrapperProps {
  children: React.ReactNode;
  enableBanner?: boolean;
  enableSnow?: boolean;
  snowIntensity?: 'light' | 'medium' | 'heavy';
}

// Helper to check if we're in the festive season (Dec 1 - Jan 5)
const isFestiveSeason = (): boolean => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();
  
  // December or early January
  return month === 11 || (month === 0 && day <= 5);
};

// Holiday offers configuration
const HOLIDAY_OFFERS = [
  {
    code: 'CHRISTMAS25',
    discount: '25% OFF',
    description: 'Christmas Special',
    expiry: new Date('2025-12-26'),
    minOrder: 2000
  },
  {
    code: 'NEWYEAR2026',
    discount: '20% OFF',
    description: 'New Year Celebration',
    expiry: new Date('2026-01-10'),
    minOrder: 1500
  },
  {
    code: 'HOLIDAY15',
    discount: '15% OFF',
    description: 'Holiday Season',
    expiry: new Date('2026-01-05'),
    minOrder: 1000
  }
];

const FestiveWrapper: React.FC<FestiveWrapperProps> = ({
  children,
  enableBanner = true,
  enableSnow = true,
  snowIntensity = 'light'
}) => {
  const [showFestive, setShowFestive] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  useEffect(() => {
    // Check if festive season and if user hasn't permanently hidden
    const festiveHidden = localStorage.getItem('festive_hidden_2025');
    setShowFestive(isFestiveSeason() && festiveHidden !== 'true');
  }, []);
  
  const handleBannerDismiss = () => {
    setBannerDismissed(true);
  };
  
  // Get active offers (not expired)
  const activeOffers = HOLIDAY_OFFERS.filter(offer => new Date() < offer.expiry);
  
  if (!showFestive) {
    return <>{children}</>;
  }
  
  return (
    <>
      {/* Snow effect in background */}
      {enableSnow && <SnowfallEffect />}
      
      {/* Festive Banner at top */}
      {enableBanner && !bannerDismissed && <FestiveBanner />}
      
      {/* Main content */}
      {children}
    </>
  );
};

export default FestiveWrapper;

// Export the offers for use in other components
export { HOLIDAY_OFFERS, isFestiveSeason };
