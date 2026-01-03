'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Don't render form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Layout showFooter={false} headerTransparent={false} className="bg-white">
      <div className="flex flex-grow min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-80px)]">
        {/* Left Column - Visuals */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 to-pink-500 relative overflow-hidden items-center justify-center">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-pink-300 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-400 blur-3xl opacity-50"></div>
          </div>

          <div className="relative z-10 text-center px-10">
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              Celebrate Life's<br />Best Moments
            </h1>
            <p className="text-xl text-purple-100 max-w-lg mx-auto leading-relaxed">
              From intimate gatherings to grand celebrations, we bring your vision to life with style and elegance.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-white opacity-100"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
              <div className="w-3 h-3 rounded-full bg-white opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 relative">
          {/* Mobile Background Elements */}
          <div className="absolute inset-0 lg:hidden overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-purple-200 blur-3xl opacity-30"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-pink-200 blur-3xl opacity-30"></div>
          </div>

          <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 lg:p-10 border border-white/50 relative z-10">
            <div className="flex justify-center mb-6 lg:hidden">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                BashItNow
              </span>
            </div>

            <LoginForm
              redirectTo={redirectTo}
              className="w-full"
            />

            <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}