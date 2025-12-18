'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count,
  interactive = false,
  onRatingChange,
  className = ''
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isHalfFilled = starRating - 0.5 <= rating && starRating > rating;

    return (
      <button
        key={index}
        onClick={() => handleStarClick(starRating)}
        disabled={!interactive}
        className={`relative ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform duration-150 ${
          interactive ? 'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 rounded' : ''
        }`}
        aria-label={`${starRating} star${starRating !== 1 ? 's' : ''}`}
      >
        {isHalfFilled ? (
          <div className="relative">
            <StarOutlineIcon className={`${sizeClasses[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <StarIcon className={`${sizeClasses[size]} text-yellow-400`} />
            </div>
          </div>
        ) : (
          <StarIcon
            className={`${sizeClasses[size]} ${
              isFilled ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-500' : ''} transition-colors duration-150`}
          />
        )}
      </button>
    );
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Stars */}
      <div className="flex space-x-0.5">
        {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
      </div>

      {/* Rating value */}
      {showValue && (
        <span className={`font-medium text-gray-700 ml-2 ${textSizeClasses[size]}`}>
          {rating.toFixed(1)}
        </span>
      )}

      {/* Review count */}
      {showCount && count !== undefined && (
        <span className={`text-gray-500 ml-1 ${textSizeClasses[size]}`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Aggregate rating display component
interface AggregateRatingProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution?: { rating: number; count: number; percentage: number }[];
  size?: 'sm' | 'md' | 'lg';
  showDistribution?: boolean;
  className?: string;
}

export function AggregateRating({
  averageRating,
  totalReviews,
  ratingDistribution,
  size = 'md',
  showDistribution = false,
  className = ''
}: AggregateRatingProps) {
  const sizeClasses = {
    sm: { text: 'text-2xl', subtext: 'text-sm' },
    md: { text: 'text-3xl', subtext: 'text-base' },
    lg: { text: 'text-4xl', subtext: 'text-lg' }
  };

  return (
    <div className={`text-center ${className}`}>
      {/* Main rating display */}
      <div className="mb-4">
        <div className={`font-bold text-gray-900 mb-2 ${sizeClasses[size].text}`}>
          {averageRating.toFixed(1)}
        </div>
        <StarRating
          rating={averageRating}
          size={size === 'sm' ? 'md' : size === 'md' ? 'lg' : 'xl'}
          showValue={false}
        />
        <p className={`text-gray-600 mt-2 ${sizeClasses[size].subtext}`}>
          Based on {totalReviews.toLocaleString()} review{totalReviews !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Rating distribution */}
      {showDistribution && ratingDistribution && (
        <div className="space-y-2 max-w-xs mx-auto">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700 w-8">
                {rating}★
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}