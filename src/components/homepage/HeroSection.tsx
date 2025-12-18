'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface HeroSectionProps {
  tagline?: string;
  backgroundVideo?: string;
  backgroundImage?: string;
  ctaText?: string;
  onBookingClick?: () => void;
}

export function HeroSection({
  tagline = "We set the BASH, in a FLASH",
  backgroundVideo,
  backgroundImage = "/images/hero-bg.jpg",
  ctaText = "Book Your Event Now",
  onBookingClick
}: HeroSectionProps) {
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/80 to-purple-600/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Tagline */}
          <motion.h1 
            className="mb-6 text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.span
              className="inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {tagline.split(' ').slice(0, 2).join(' ')}
            </motion.span>
            <br />
            <motion.span
              className="inline-block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {tagline.split(' ').slice(2).join(' ')}
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="mb-8 text-xl md:text-2xl lg:text-3xl font-light max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Event Décor at Your Doorstep in{' '}
            <motion.span
              className="font-bold text-yellow-300"
              animate={{ 
                scale: [1, 1.1, 1],
                textShadow: [
                  "0 0 0px rgba(255,255,255,0)",
                  "0 0 20px rgba(255,255,255,0.8)",
                  "0 0 0px rgba(255,255,255,0)"
                ]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              Few Minutes!
            </motion.span>
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.button
              onClick={handleBookingClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-pink-600 bg-white rounded-full shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {/* Button background animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Button text */}
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                {ctaText}
              </span>
              
              {/* Arrow icon */}
              <motion.svg
                className="relative z-10 ml-2 w-5 h-5 group-hover:text-white transition-colors duration-300"
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
          </motion.div>

          {/* Trust Signals */}
          {/* <motion.div
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">500+</div>
              <div className="text-sm md:text-base">Happy Clients</div>
            </motion.div>
            
            <div className="hidden md:block w-px h-8 bg-white/30" />
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-yellow-300">1000+</div>
              <div className="text-sm md:text-base">Events Completed</div>
            </motion.div>
            
            <div className="hidden md:block w-px h-8 bg-white/30" />
            
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-yellow-300 flex items-center justify-center">
                4.9
                <motion.svg
                  className="w-6 h-6 ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              </div>
              <div className="text-sm md:text-base">Average Rating</div>
            </motion.div>
          </motion.div> */}
        </motion.div>
      </div>

      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-20 right-10 w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-white/5 backdrop-blur-sm"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -180, -360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
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