'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  SocialProofIndicators, 
  CompactSocialProof,
  LiveActivity 
} from '@/components/testimonials';
import { testimonialsService } from '@/services/testimonialsService';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  event: string;
  image?: string;
}

interface TrustSignalsProps {
  clientCount?: number;
  eventsCompleted?: number;
  averageRating?: number;
  reviews?: Review[];
  showSocialProof?: boolean;
  showLiveActivity?: boolean;
}

const defaultReviews: Review[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    rating: 5,
    comment: 'Amazing service! They transformed my living room into a birthday wonderland in just 45 minutes!',
    event: 'Birthday Party',
    image: '/images/reviews/priya.jpg'
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    rating: 5,
    comment: 'Professional team, beautiful decorations, and exactly on time. Highly recommended!',
    event: 'Anniversary',
    image: '/images/reviews/rajesh.jpg'
  },
  {
    id: '3',
    name: 'Anita Patel',
    rating: 5,
    comment: 'The baby shower setup was perfect! Every detail was taken care of beautifully.',
    event: 'Baby Shower',
    image: '/images/reviews/anita.jpg'
  },
  {
    id: '4',
    name: 'Vikram Singh',
    rating: 5,
    comment: 'Corporate event decoration was elegant and professional. Great job!',
    event: 'Corporate Event',
    image: '/images/reviews/vikram.jpg'
  }
];

export function TrustSignals({
  clientCount = 500,
  eventsCompleted = 1000,
  averageRating = 4.9,
  reviews = defaultReviews,
  showSocialProof = true,
  showLiveActivity = true
}: TrustSignalsProps) {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [socialProofStats, setSocialProofStats] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    // Load social proof stats
    if (showSocialProof) {
      const loadStats = async () => {
        try {
          // Use mock data for now
          const stats = testimonialsService.getMockSocialProofStats();
          setSocialProofStats(stats);
        } catch (error) {
          console.error('Failed to load social proof stats:', error);
          // Fallback to props
          setSocialProofStats({
            totalClients: clientCount,
            totalEvents: eventsCompleted,
            averageRating,
            totalReviews: reviews.length * 10, // Estimate
            yearsInBusiness: 3,
            citiesServed: 12,
            setupTime: 60,
            satisfactionRate: 96,
            recentBookings: { count: 15, timeframe: '24 hours' }
          });
        }
      };
      loadStats();
    }
  }, [showSocialProof, clientCount, eventsCompleted, averageRating, reviews.length]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: i * 0.1, type: "spring", stiffness: 500 }}
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </motion.svg>
    ));
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-16">
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Trusted by{' '}
              <motion.span
                className="text-pink-600"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {clientCount.toLocaleString()}+
              </motion.span>{' '}
              Happy Clients
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied customers who have made their celebrations memorable with BashItNow
            </p>
          </motion.div>

          {/* Social Proof Indicators */}
          {showSocialProof && socialProofStats && (
            <motion.div variants={itemVariants} className="mb-16">
              <SocialProofIndicators 
                stats={socialProofStats}
                animated={true}
                layout="grid"
                showIcons={true}
              />
              
              {/* Live Activity */}
              {showLiveActivity && (
                <div className="flex justify-center mt-8">
                  <LiveActivity
                    recentBookings={socialProofStats.recentBookings.count}
                    timeframe={socialProofStats.recentBookings.timeframe}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* Fallback Stats Grid (when social proof is disabled) */}
          {!showSocialProof && (
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              {/* Client Count */}
              <motion.div
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-pink-600 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  {clientCount.toLocaleString()}+
                </motion.div>
                <div className="text-gray-600 font-medium">Happy Clients</div>
                <div className="mt-2 flex justify-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-pink-300 rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Events Completed */}
              <motion.div
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-purple-600 mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {eventsCompleted.toLocaleString()}+
                </motion.div>
                <div className="text-gray-600 font-medium">Events Completed</div>
                <div className="mt-2 flex justify-center">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-purple-300 rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Average Rating */}
              <motion.div
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-yellow-500 mb-2 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  {averageRating}
                  <motion.svg
                    className="w-8 h-8 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                </motion.div>
                <div className="text-gray-600 font-medium">Average Rating</div>
                <div className="mt-2 flex justify-center">
                  {renderStars(5)}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Review Carousel */}
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
              What Our Clients Say
            </h3>
            
            <div className="relative bg-white rounded-2xl shadow-xl p-8 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full -translate-y-16 translate-x-16" />
              
              <motion.div
                key={currentReviewIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Review Content */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {renderStars(reviews[currentReviewIndex].rating)}
                    </div>
                    
                    <blockquote className="text-lg md:text-xl text-gray-700 mb-4 italic">
                      &ldquo;{reviews[currentReviewIndex].comment}&rdquo;
                    </blockquote>
                    
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {reviews[currentReviewIndex].name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {reviews[currentReviewIndex].name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reviews[currentReviewIndex].event}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Review indicators */}
              <div className="flex justify-center mt-6 space-x-2">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentReviewIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index === currentReviewIndex
                        ? 'bg-pink-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Partner Logos */}
          <motion.div variants={itemVariants} className="mt-16 text-center">
            <p className="text-gray-500 mb-8">Trusted by leading event planners and venues</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              {/* Placeholder for partner logos */}
              <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 1</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 2</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 3</span>
              </div>
              <div className="w-24 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Partner 4</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}