'use client';

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  ChatBubbleLeftRightIcon, 
  DevicePhoneMobileIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

interface Review {
  id: string;
  platform: 'google' | 'whatsapp' | 'instagram' | 'facebook';
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  screenshot?: string;
  verified: boolean;
}

interface ReviewsDisplayProps {
  reviews: Review[];
  showScreenshots?: boolean;
  maxReviews?: number;
}

export default function ReviewsDisplay({
  reviews,
  showScreenshots = true,
  maxReviews = 12
}: ReviewsDisplayProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const platformIcons = {
    google: <GlobeAltIcon className="h-5 w-5" />,
    whatsapp: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
    instagram: <DevicePhoneMobileIcon className="h-5 w-5" />,
    facebook: <GlobeAltIcon className="h-5 w-5" />
  };

  const platformColors = {
    google: 'bg-blue-100 text-blue-800 border-blue-200',
    whatsapp: 'bg-green-100 text-green-800 border-green-200',
    instagram: 'bg-pink-100 text-pink-800 border-pink-200',
    facebook: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  const filteredReviews = selectedPlatform === 'all' 
    ? reviews 
    : reviews.filter(review => review.platform === selectedPlatform);

  const displayedReviews = showAll 
    ? filteredReviews 
    : filteredReviews.slice(0, maxReviews);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getPlatformName = (platform: string) => {
    const names = {
      google: 'Google Reviews',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook'
    };
    return names[platform as keyof typeof names] || platform;
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = Array.from({ length: 5 }, (_, index) => {
    const rating = 5 - index;
    const count = reviews.filter(review => review.rating === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with overall stats */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-600">
              Based on {reviews.length} reviews
            </p>
          </div>

          {/* Rating distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 w-8">
                  {rating}★
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedPlatform('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedPlatform === 'all'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        {Object.keys(platformIcons).map(platform => {
          const count = reviews.filter(review => review.platform === platform).length;
          if (count === 0) return null;
          
          return (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
                selectedPlatform === platform
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {platformIcons[platform as keyof typeof platformIcons]}
              <span>{getPlatformName(platform)} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Reviews grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
            {/* Screenshot if available */}
            {showScreenshots && review.screenshot && (
              <div className="aspect-video bg-gray-100">
                <img
                  src={review.screenshot}
                  alt={`Review from ${review.customerName}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              {/* Platform badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${
                  platformColors[review.platform as keyof typeof platformColors]
                }`}>
                  {platformIcons[review.platform as keyof typeof platformIcons]}
                  <span>{getPlatformName(review.platform)}</span>
                </span>
                {review.verified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex space-x-1">
                  {renderStars(review.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {review.rating}/5
                </span>
              </div>

              {/* Comment */}
              <blockquote className="text-gray-800 mb-4 line-clamp-4">
                "{review.comment}"
              </blockquote>

              {/* Customer info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.customerName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more button */}
      {filteredReviews.length > maxReviews && !showAll && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="bg-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-pink-700 transition-colors duration-200"
          >
            Show All Reviews ({filteredReviews.length})
          </button>
        </div>
      )}

      {/* Empty state */}
      {displayedReviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No reviews found
          </h3>
          <p className="text-gray-600">
            {selectedPlatform === 'all' 
              ? 'No reviews available yet.' 
              : `No reviews from ${getPlatformName(selectedPlatform)} yet.`
            }
          </p>
        </div>
      )}
    </div>
  );
}