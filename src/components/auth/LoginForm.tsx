'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '@/types';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { GoogleAuthButton } from './GoogleAuthButton';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function LoginForm({
  onSuccess,
  redirectTo = '/',
  className = '',
  title = 'Welcome Back',
  subtitle = 'Sign in to continue your celebration journey'
}: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginCredentials>>({});
  const [submitError, setSubmitError] = useState<string>('');

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginCredentials> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showErrorToast('Please fix the errors in the form');
      return;
    }

    try {
      await login(formData);
      showSuccessToast('Welcome back! Login successful.');

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to specified page or dashboard
        window.location.href = redirectTo;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setSubmitError(message);
      showErrorToast(message);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {subtitle}
          </p>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
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

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <a href="#" className="text-xs font-medium text-pink-600 hover:text-pink-500">
              Forgot password?
            </a>
          </div>
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
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center mt-1 animate-fadeIn">
              <span className="mr-1">⚠️</span> {errors.password}
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
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Signing In..."
          className="w-full py-3.5 text-lg shadow-lg shadow-purple-200 transform hover:-translate-y-1"
        >
          <span className="flex items-center justify-center">
            Sign In
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </LoadingButton>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <GoogleAuthButton text="Sign in with Google" />

        {/* Register Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-80 transition-opacity"
            >
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div >
  );
}