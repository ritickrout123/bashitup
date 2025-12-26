'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/layout/Header';

interface IntegratedHeroSectionProps {
  tagline?: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  ctaText?: string;
  onBookingClick?: () => void;
}

export function IntegratedHeroSection({
  tagline = "We set the BASH, in a FLASH",
  backgroundVideo,
  backgroundImage = "/images/hero-bg.jpg",
  ctaText = "Book Your Event Now",
  onBookingClick
}: IntegratedHeroSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
    }
  }, []);

  const handleBookingClick = () => {
    // Track click event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'CTA',
        event_label: 'Hero Book Now Button',
        value: 1
      });
    }
    
    if (onBookingClick) {
      onBookingClick();
    } else {
      // Scroll to quick booking widget
      const quickBookingElement = document.getElementById('quick-booking');
      if (quickBookingElement) {
        quickBookingElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {backgroundVideo && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              isVideoLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        
        {/* Fallback background image */}
        <div 
          className={`absolute inset-0 w-full h-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 transition-opacity duration-1000 ${
            backgroundVideo && isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 via-purple-600/85 to-indigo-700/90" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/10 backdrop-blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 backdrop-blur-3xl"
            animate={{
              y: [0, 40, 0],
              x: [0, -30, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-yellow-300/10 backdrop-blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Integrated Header */}
      <div className="relative z-50">
        <Header variant="hero-integrated" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white pt-20 lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Main Tagline */}
            <motion.h1 
              className="mb-8 text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              <motion.span
                className="inline-block drop-shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                We set the{' '}
                <motion.span
                  className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  BASH
                </motion.span>
              </motion.span>
              <br />
              <motion.span
                className="inline-block drop-shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                in a{' '}
                <motion.span
                  className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  FLASH
                </motion.span>
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="mb-12 text-xl md:text-3xl lg:text-4xl font-light max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Event Décor at Your Doorstep in{' '}
              <motion.span
                className="font-bold text-yellow-300 drop-shadow-lg"
                animate={{ 
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 0px rgba(255,255,255,0)",
                    "0 0 30px rgba(255,255,255,0.8)",
                    "0 0 0px rgba(255,255,255,0)"
                  ]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                Few Minutes!
              </motion.span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              {/* Primary CTA */}
              <motion.button
                onClick={handleBookingClick}
                className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Button background animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-orange-400"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Button text */}
                <span className="relative z-10 mr-3">
                  {ctaText}
                </span>
                
                {/* Arrow icon */}
                <motion.svg
                  className="relative z-10 w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </motion.svg>
              </motion.button>

              {/* Secondary CTA */}
              <motion.a
                href="/portfolio"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">View Our Work</span>
                <motion.svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              </motion.a>
            </motion.div>

            {/* Trust Signals */}
            <motion.div
              className="mt-16 flex flex-wrap justify-center items-center gap-8 lg:gap-12 text-white/90"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
            >
              <motion.div 
                className="text-center backdrop-blur-sm bg-white/10 rounded-2xl px-6 py-4"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-1">500+</div>
                <div className="text-sm md:text-base font-medium">Happy Clients</div>
              </motion.div>
              
              <div className="hidden md:block w-px h-12 bg-white/30" />
              
              <motion.div 
                className="text-center backdrop-blur-sm bg-white/10 rounded-2xl px-6 py-4"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-1">1000+</div>
                <div className="text-sm md:text-base font-medium">Events Completed</div>
              </motion.div>
              
              <div className="hidden md:block w-px h-12 bg-white/30" />
              
              <motion.div 
                className="text-center backdrop-blur-sm bg-white/10 rounded-2xl px-6 py-4"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 flex items-center justify-center mb-1">
                  4.9
                  <motion.svg
                    className="w-7 h-7 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                </div>
                <div className="text-sm md:text-base font-medium">Average Rating</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center backdrop-blur-sm">
          <motion.div
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}