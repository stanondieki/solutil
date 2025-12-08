'use client';

import React from 'react';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  maxRating = 5, 
  size = 'md',
  showValue = true,
  reviewCount 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = maxRating - Math.ceil(rating);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar 
          key={`full-${i}`} 
          className={`${sizeClasses[size]} text-yellow-400`} 
        />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <FaStarHalfAlt 
          key="half" 
          className={`${sizeClasses[size]} text-yellow-400`} 
        />
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaStar 
          key={`empty-${i}`} 
          className={`${sizeClasses[size]} text-gray-300`} 
        />
      );
    }

    return stars;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>
      {showValue && (
        <div className={`${textSizeClasses[size]} text-gray-600 flex items-center space-x-1`}>
          <span className="font-medium">{rating.toFixed(1)}</span>
          {reviewCount !== undefined && (
            <span>({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;