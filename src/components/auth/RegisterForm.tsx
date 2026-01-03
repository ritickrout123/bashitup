'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRegistration } from '@/types';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterForm({ onSuccess, redirectTo = '/', className = '' }: RegisterFormProps) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+91|91)?[6-9]\d{9}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid Indian phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = [];

      if (formData.password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('one uppercase letter');
      }
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('one lowercase letter');
      }
      if (!/\d/.test(formData.password)) {
        passwordErrors.push('one number');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        passwordErrors.push('one special character');
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const userData: UserRegistration = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase(),
        phone: formData.phone.replace(/\s+/g, ''),
        password: formData.password,
        role: 'CUSTOMER',
      };

      await register(userData);

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to specified page or dashboard
        window.location.href = redirectTo;
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            Join BashItNow
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Start booking amazing event decorations in minutes
          </p>
        </div>

        {/* Name Field */}
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <div className="relative group">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${errors.name
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-purple-500 bg-gray-50 focus:bg-white hover:border-purple-300'
                }
              `}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <div className="relative group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${errors.email
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-purple-500 bg-gray-50 focus:bg-white hover:border-purple-300'
                }
              `}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-1">
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
            Phone Number
          </label>
          <div className="relative group">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${errors.phone
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-purple-500 bg-gray-50 focus:bg-white hover:border-purple-300'
                }
              `}
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.phone}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <div className="relative group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${errors.password
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-purple-500 bg-gray-50 focus:bg-white hover:border-purple-300'
                }
              `}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
            Confirm Password
          </label>
          <div className="relative group">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
                ${errors.confirmPassword
                  ? 'border-red-300 focus:border-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-purple-500 bg-gray-50 focus:bg-white hover:border-purple-300'
                }
              `}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center animate-fadeIn">
            <span className="text-red-500 mr-2">⚠️</span>
            <p className="text-sm text-red-600 font-medium">{submitError}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative overflow-hidden group py-3.5 px-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-200 transition-all duration-300
            bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 mt-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              Creating Account...
            </div>
          ) : (
            <span className="flex items-center justify-center">
              Create Account
              <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          )}
        </button>

        {/* Login Link */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition-opacity"
            >
              Sign in here
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}