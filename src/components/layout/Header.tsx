'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '../../../public/icons/logo.png';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  transparent?: boolean;
  showBookingCTA?: boolean;
}

export default function Header({ transparent = false, showBookingCTA = true }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
            <Link href="/" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              Home
            </Link>
            <Link href="/themes" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              Themes
            </Link>
            <Link href="/portfolio" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              Portfolio
            </Link>
            <Link href="/pricing" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              Pricing
            </Link>
            <Link href="/how-it-works" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              How It Works
            </Link>
            <Link href="/about" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              About
            </Link>
            <Link href="/contact" className={`${textClasses} ${transparent ? 'hover:text-yellow-300' : 'hover:text-purple-600'} transition-colors font-medium`}>
              Contact
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
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/themes"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Themes
              </Link>
              <Link
                href="/portfolio"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Portfolio
              </Link>
              <Link
                href="/pricing"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={`block px-3 py-2 rounded-md text-base font-medium ${textClasses} hover:bg-gray-100 hover:bg-opacity-20 transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
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