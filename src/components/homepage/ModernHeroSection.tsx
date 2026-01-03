'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/icons/logo.png';
import { useAuth } from '@/hooks/useAuth';

interface ModernHeroSectionProps {
  tagline?: string;
  backgroundImage?: string;
  ctaText?: string;
  onBookingClick?: () => void;
}

export function ModernHeroSection({
  tagline = "We set the BASH, in a FLASH",
  backgroundImage = "/images/hero-bg.jpg",
  ctaText = "Book Your Event Now",
  onBookingClick
}: ModernHeroSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Handle scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100); // Change after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookingClick = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      router.push('/booking');
    }
  };

  // Check if a path is active
  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Get navigation link classes
  const getNavLinkClasses = (path: string) => {
    const baseClasses = 'transition-all duration-300 font-medium relative';
    const isActive = isActivePath(path);

    if (isScrolled) {
      return `${baseClasses} ${isActive
        ? 'text-purple-600 font-semibold'
        : 'text-gray-800 hover:text-purple-600'
        }`;
    } else {
      return `${baseClasses} ${isActive
        ? 'text-yellow-300 font-semibold'
        : 'text-white/90 hover:text-yellow-300'
        }`;
    }
  };

  // Get mobile navigation link classes
  const getMobileNavLinkClasses = (path: string) => {
    const baseClasses = 'block px-4 py-3 rounded-lg transition-colors font-medium';
    const isActive = isActivePath(path);

    if (isScrolled) {
      return `${baseClasses} ${isActive
        ? 'text-purple-600 bg-purple-50 font-semibold'
        : 'text-gray-800 hover:bg-gray-100'
        }`;
    } else {
      return `${baseClasses} ${isActive
        ? 'text-yellow-300 bg-white/20 font-semibold'
        : 'text-white hover:bg-white/20'
        }`;
    }
  };

  // Dynamic styles based on scroll position
  const navBgClass = isScrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg'
    : 'bg-white/10 backdrop-blur-md border-b border-white/20';

  const textClass = isScrolled ? 'text-gray-800' : 'text-white/90';
  const logoClass = isScrolled ? 'text-gray-800' : 'text-white';
  const hoverClass = isScrolled ? 'hover:text-purple-600' : 'hover:text-yellow-300';
  const mobileMenuBg = isScrolled ? 'bg-white border-gray-200' : 'bg-black/90 border-white/20';
  const mobileTextClass = isScrolled ? 'text-gray-800' : 'text-white';
  const mobileHoverBg = isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20';

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/90 via-purple-600/85 to-indigo-700/90" />
      </div>

      {/* Top Navigation Bar - Fixed/Sticky with adaptive styling */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBgClass}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/" className={`${logoClass} hover:opacity-80 transition-all duration-300`}>
                <Image
                  src={logo}
                  alt="BashItNow Logo"
                  className={`w-auto h-12 lg:h-16 ${!isScrolled ? 'brightness-0 invert' : ''} transition-all duration-300`}
                  priority
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              className="hidden lg:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/" className={getNavLinkClasses('/')}>
                Home
                {isActivePath('/') && (
                  <motion.div
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isScrolled ? 'bg-purple-600' : 'bg-yellow-300'}`}
                    layoutId="activeIndicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              <Link href="/themes" className={getNavLinkClasses('/themes')}>
                Themes
                {isActivePath('/themes') && (
                  <motion.div
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isScrolled ? 'bg-purple-600' : 'bg-yellow-300'}`}
                    layoutId="activeIndicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
              <Link href="/portfolio" className={getNavLinkClasses('/portfolio')}>
                Portfolio
                {isActivePath('/portfolio') && (
                  <motion.div
                    className={`absolute -bottom-1 left-0 right-0 h-0.5 ${isScrolled ? 'bg-purple-600' : 'bg-yellow-300'}`}
                    layoutId="activeIndicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            </motion.div>

            {/* User Menu & CTA */}
            <motion.div
              className="hidden lg:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className={`${textClass} ${hoverClass} transition-colors font-medium`}>
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className={`${textClass} ${hoverClass} transition-colors font-medium`}>
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className={`${textClass} ${hoverClass} transition-colors font-medium`}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className={`${textClass} ${hoverClass} transition-colors font-medium`}>
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={`${isScrolled
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-white/20 text-white hover:bg-white/30'
                      } px-4 py-2 rounded-lg font-medium transition-all duration-300`}
                  >
                    Register
                  </Link>
                </div>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/booking"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-2 rounded-full font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg"
                >
                  Book Now
                </Link>
              </motion.div>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-lg ${textClass} ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'} transition-colors`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              className={`lg:hidden ${mobileMenuBg} backdrop-blur-md rounded-xl mt-4 mb-4 shadow-2xl border overflow-hidden`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-6 space-y-2">
                <Link href="/" className={getMobileNavLinkClasses('/')}>
                  Home
                </Link>
                <Link href="/themes" className={getMobileNavLinkClasses('/themes')}>
                  Themes
                </Link>
                <Link href="/portfolio" className={getMobileNavLinkClasses('/portfolio')}>
                  Portfolio
                </Link>

                <div className={`border-t ${isScrolled ? 'border-gray-200' : 'border-white/20'} pt-4 mt-4`}>
                  {user ? (
                    <>
                      <Link href="/dashboard" className={`block px-4 py-3 rounded-lg ${mobileTextClass} ${mobileHoverBg} transition-colors font-medium`}>
                        Dashboard
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" className={`block px-4 py-3 rounded-lg ${mobileTextClass} ${mobileHoverBg} transition-colors font-medium`}>
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className={`block w-full text-left px-4 py-3 rounded-lg ${mobileTextClass} ${mobileHoverBg} transition-colors font-medium`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={`block px-4 py-3 rounded-lg ${mobileTextClass} ${mobileHoverBg} transition-colors font-medium`}>
                        Login
                      </Link>
                      <Link href="/register" className={`block px-4 py-3 rounded-lg ${mobileTextClass} ${mobileHoverBg} transition-colors font-medium`}>
                        Register
                      </Link>
                    </>
                  )}

                  <Link
                    href="/booking"
                    className="block mx-4 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-full font-bold text-center hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-lg"
                  >
                    Book Your Event Now
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center pt-20 lg:pt-24">
        <div className="container mx-auto px-4 text-center text-white py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {/* Main Tagline */}
            <motion.h1
              className="mb-8 text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.span
                className="inline-block drop-shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                We set the{' '}
                <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  BASH
                </span>
              </motion.span>
              <br />
              <motion.span
                className="inline-block drop-shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.4 }}
              >
                in a{' '}
                <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  FLASH
                </span>
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mb-12 text-xl md:text-3xl lg:text-4xl font-light max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              Event Décor at Your Doorstep in{' '}
              <span className="font-bold text-yellow-300 drop-shadow-lg">
                Few Minutes!
              </span>
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              <motion.button
                onClick={handleBookingClick}
                className="inline-flex items-center justify-center px-8 py-4 text-lg md:px-10 md:py-5 md:text-xl lg:px-12 lg:py-6 lg:text-2xl font-bold text-gray-900 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <span className="mr-3">{ctaText}</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}