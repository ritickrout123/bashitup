'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from '../../../public/icons/logo.png';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  transparent?: boolean;
  showBookingCTA?: boolean;
  variant?: 'default' | 'hero-integrated';
}

export default function Header({ transparent = false, showBookingCTA = true, variant = 'default' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Check if a path is active
  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  // Get navigation link classes for default header
  const getNavLinkClasses = (path: string) => {
    const isActive = isActivePath(path);
    const baseClasses = `transition-colors font-medium relative`;
    
    if (transparent) {
      return `${baseClasses} ${isActive 
        ? 'text-yellow-300 font-semibold' 
        : 'text-white drop-shadow-lg hover:text-yellow-300'
      }`;
    } else {
      return `${baseClasses} ${isActive 
        ? 'text-purple-600 font-semibold' 
        : 'text-gray-800 hover:text-purple-600'
      }`;
    }
  };

  // Get mobile navigation link classes for default header
  const getMobileNavLinkClasses = (path: string) => {
    const isActive = isActivePath(path);
    const baseClasses = `block px-3 py-2 rounded-md text-base font-medium transition-colors`;
    
    if (transparent) {
      return `${baseClasses} ${isActive 
        ? 'text-yellow-300 bg-white/20 font-semibold' 
        : 'text-white drop-shadow-lg hover:bg-gray-100 hover:bg-opacity-20'
      }`;
    } else {
      return `${baseClasses} ${isActive 
        ? 'text-purple-600 bg-purple-50 font-semibold' 
        : 'text-gray-800 hover:bg-gray-100 hover:bg-opacity-20'
      }`;
    }
  };

  // Hero integrated variant - completely transparent with better styling
  if (variant === 'hero-integrated') {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/" className="text-white hover:opacity-80 transition-opacity">
                <Image src={logo} alt="BashItNow Logo" className="w-auto h-16 lg:h-20 drop-shadow-lg" priority />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav 
              className="hidden lg:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link href="/" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                Home
              </Link>
              <Link href="/themes" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                Themes
              </Link>
              <Link href="/portfolio" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                Portfolio
              </Link>
              {/* <Link href="/about" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                About
              </Link>
              <Link href="/contact" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                Contact
              </Link> */}
            </motion.nav>

            {/* User Menu & CTA */}
            <motion.div 
              className="hidden lg:flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard" className="text-white/90 hover:text-yellow-300 transition-colors font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                    Dashboard
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-white/90 hover:text-yellow-300 transition-colors font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10">
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-white/90 hover:text-yellow-300 transition-colors font-medium backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white/10"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-white/90 hover:text-yellow-300 transition-colors font-medium backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/10 border border-white/20">
                    Login
                  </Link>
                  <Link href="/register" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all duration-300 border border-white/30">
                    Register
                  </Link>
                </div>
              )}

              {showBookingCTA && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/booking"
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-full font-bold hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Book Now
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Toggle menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <motion.div 
              className="lg:hidden"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black/90 backdrop-blur-md rounded-xl mt-4 shadow-2xl border border-white/20 overflow-hidden">
                <div className="px-4 py-6 space-y-2">
                  <Link
                    href="/"
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/themes"
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Themes
                  </Link>
                  <Link
                    href="/portfolio"
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Portfolio
                  </Link>
                  {/* <Link
                    href="/about"
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact
                  </Link> */}

                  {/* Mobile User Menu */}
                  <div className="border-t border-white/20 pt-4 mt-4">
                    {user ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-3 rounded-lg text-white hover:bg-white/20 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Register
                        </Link>
                      </>
                    )}

                    {showBookingCTA && (
                      <Link
                        href="/booking"
                        className="block mx-4 mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-full font-bold text-center hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 shadow-xl"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Book Your Event Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </header>
    );
  }

  // Default header variant (existing functionality)
  const headerClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${transparent
      ? 'bg-black/20 backdrop-blur-md border-b border-white/10'
      : 'bg-white shadow-md'
    }
  `;

  const textClasses = transparent ? 'text-white drop-shadow-lg' : 'text-gray-800';
  const logoClasses = transparent ? 'text-white drop-shadow-lg' : 'text-purple-600';

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className={`text-2xl font-bold ${logoClasses} hover:opacity-80 transition-opacity`}>
            <Image src={logo} alt="Logo" className="w-auto h-14 md:h-28" priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className={getNavLinkClasses('/')}>
              Home
              {isActivePath('/') && (
                <div className={`absolute -bottom-1 left-0 right-0 h-0.5 ${transparent ? 'bg-yellow-300' : 'bg-purple-600'}`} />
              )}
            </Link>
            <Link href="/themes" className={getNavLinkClasses('/themes')}>
              Themes
              {isActivePath('/themes') && (
                <div className={`absolute -bottom-1 left-0 right-0 h-0.5 ${transparent ? 'bg-yellow-300' : 'bg-purple-600'}`} />
              )}
            </Link>
            <Link href="/portfolio" className={getNavLinkClasses('/portfolio')}>
              Portfolio
              {isActivePath('/portfolio') && (
                <div className={`absolute -bottom-1 left-0 right-0 h-0.5 ${transparent ? 'bg-yellow-300' : 'bg-purple-600'}`} />
              )}
            </Link>
          </nav>

          {/* User Menu & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
                  Dashboard
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
                  Login
                </Link>
                <Link href="/register" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
                  Register
                </Link>
              </div>
            )}

            {showBookingCTA && (
              <Link
                href="/booking"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book Your Event Now
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 rounded-md ${textClasses} ${transparent ? 'hover:bg-white/20' : 'hover:bg-gray-100'} transition-colors`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 ${transparent ? 'bg-black/90 backdrop-blur-md' : 'bg-white'} rounded-lg mt-2 shadow-lg`}>
              <Link
                href="/"
                className={getMobileNavLinkClasses('/')}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/themes"
                className={getMobileNavLinkClasses('/themes')}
                onClick={() => setIsMenuOpen(false)}
              >
                Themes
              </Link>
              <Link
                href="/portfolio"
                className={getMobileNavLinkClasses('/portfolio')}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>

              {/* Mobile User Menu */}
              <div className="border-t border-gray-200 border-opacity-20 pt-4">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}

                {showBookingCTA && (
                  <Link
                    href="/booking"
                    className="block mx-3 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Book Your Event Now
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}