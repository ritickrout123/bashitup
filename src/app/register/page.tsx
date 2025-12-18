'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout';
import RegisterForm from '@/components/auth/RegisterForm';

function RegisterContent() {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Layout footerVariant="minimal" className="bg-gray-50">
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join BashItNow
            </h1>
            <p className="text-gray-600">
              Create your account to start booking amazing event decorations in just Few Minutes.
            </p>
          </div>
          
          <RegisterForm 
            redirectTo={redirectTo}
            className="bg-white p-8 rounded-lg shadow-md"
          />
        </div>
      </div>
    </Layout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}