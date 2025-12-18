'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { Testimonial } from '@/types';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showVideoFirst?: boolean;
}

export default function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showVideoFirst = true
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  // Sort testimonials to show video testimonials first if requested
  const sortedTestimonials = showVideoFirst 
    ? [...testimonials].sort((a, b) => {
        if (a.videoUrl && !b.videoUrl) return -1;
        if (!a.videoUrl && b.videoUrl) return 1;
        return 0;
      })
    : testimonials;

  useEffect(() => {
    if (!autoPlay || sortedTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === sortedTestimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, sortedTestimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? sortedTestimonials.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === sortedTestimonials.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleVideoPlay = (testimonialId: string) => {
    setPlayingVideoId(testimonialId);
    setIsPlaying(true);
  };

  const handleVideoEnd = () => {
    setPlayingVideoId(null);
    setIsPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (sortedTestimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No testimonials available</p>
      </div>
    );
  }

  const currentTestimonial = sortedTestimonials[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Main testimonial display */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Video testimonial */}
          {currentTestimonial.videoUrl && (
            <div className="mb-6">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {playingVideoId === currentTestimonial.id ? (
                  <video
                    className="w-full h-full object-cover"
                    controls
                    autoPlay
                    onEnded={handleVideoEnd}
                    src={currentTestimonial.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div 
                    className="relative w-full h-full bg-gray-900 flex items-center justify-center cursor-pointer group"
                    onClick={() => handleVideoPlay(currentTestimonial.id)}
                  >
                    <video
                      className="w-full h-full object-cover opacity-70"
                      muted
                      src={currentTestimonial.videoUrl}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 transition-all duration-200">
                        <PlayIcon className="h-8 w-8 text-pink-600 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex space-x-1">
              {renderStars(currentTestimonial.rating)}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {currentTestimonial.rating}/5
            </span>
          </div>

          {/* Comment */}
          <blockquote className="text-lg text-gray-800 mb-6 leading-relaxed">
            "{currentTestimonial.comment}"
          </blockquote>

          {/* Images */}
          {currentTestimonial.images && currentTestimonial.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {currentTestimonial.images.slice(0, 6).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Testimonial image ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Customer info placeholder - would need to join with user data */}
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {currentTestimonial.customerId.charAt(0).toUpperCase()}
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Verified Customer</p>
              <p className="text-sm text-gray-500">
                {new Date(currentTestimonial.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {sortedTestimonials.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-200 z-10"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {sortedTestimonials.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {sortedTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentIndex
                  ? 'bg-pink-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}