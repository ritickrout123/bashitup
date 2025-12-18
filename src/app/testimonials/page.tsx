'use client';

import React, { useState, useEffect } from 'react';
import { 
  TestimonialCarousel, 
  ReviewsDisplay, 
  SocialProofIndicators,
  CompactSocialProof,
  LiveActivity,
  TrustBadges
} from '@/components/testimonials';
import { testimonialsService } from '@/services/testimonialsService';
import { Testimonial } from '@/types';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  HeartIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [socialProofStats, setSocialProofStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // For now, use mock data since we don't have real data yet
        const mockTestimonials = testimonialsService.getMockTestimonials();
        const mockStats = testimonialsService.getMockSocialProofStats();
        
        setTestimonials(mockTestimonials);
        setSocialProofStats(mockStats);
        
        // Uncomment when API is ready:
        // const [testimonialsData, statsData] = await Promise.all([
        //   testimonialsService.getTestimonials({ publicOnly: true, limit: 10 }),
        //   testimonialsService.getSocialProofStats()
        // ]);
        // setTestimonials(testimonialsData.testimonials);
        // setSocialProofStats(statsData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const mockReviews = testimonialsService.getMockReviews();

  const trustBadges = [
    {
      name: 'Verified Service',
      icon: <ShieldCheckIcon className="h-5 w-5" />,
      description: 'Background checked team'
    },
    {
      name: '60-Min Setup',
      icon: <ClockIcon className="h-5 w-5" />,
      description: 'Quick & efficient'
    },
    {
      name: '96% Satisfaction',
      icon: <HeartIcon className="h-5 w-5" />,
      description: 'Happy customers'
    },
    {
      name: 'Award Winning',
      icon: <TrophyIcon className="h-5 w-5" />,
      description: 'Industry recognition'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Real stories from real celebrations
            </p>
            
            {/* Compact social proof */}
            {socialProofStats && (
              <CompactSocialProof
                totalClients={socialProofStats.totalClients}
                averageRating={socialProofStats.averageRating}
                totalReviews={socialProofStats.totalReviews}
                className="justify-center"
              />
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Social Proof Indicators */}
        {socialProofStats && (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-gray-600">
                Join our community of happy customers
              </p>
            </div>
            <SocialProofIndicators 
              stats={socialProofStats}
              animated={true}
              layout="grid"
              className="mb-8"
            />
            
            {/* Live activity */}
            <div className="flex justify-center">
              <LiveActivity
                recentBookings={socialProofStats.recentBookings.count}
                timeframe={socialProofStats.recentBookings.timeframe}
              />
            </div>
          </section>
        )}

        {/* Video Testimonials Carousel */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Customer Stories
            </h2>
            <p className="text-gray-600">
              Hear directly from our customers about their experience
            </p>
          </div>
          <TestimonialCarousel 
            testimonials={testimonials}
            autoPlay={true}
            showVideoFirst={true}
          />
        </section>

        {/* Reviews Display */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Reviews Across Platforms
            </h2>
            <p className="text-gray-600">
              See what customers are saying on Google, WhatsApp, and social media
            </p>
          </div>
          <ReviewsDisplay 
            reviews={mockReviews}
            showScreenshots={true}
            maxReviews={6}
          />
        </section>

        {/* Trust Badges */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BashItNow?
            </h2>
            <p className="text-gray-600">
              Quality and trust you can count on
            </p>
          </div>
          <TrustBadges badges={trustBadges} />
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Your Own Success Story?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of satisfied customers and make your celebration unforgettable
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200">
              Book Your Event Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-600 transition-colors duration-200">
              View Our Themes
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}