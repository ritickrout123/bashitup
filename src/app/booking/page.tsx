'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout';
import { BookingForm } from '@/components/booking/BookingForm';
import { BookingData, Theme, APIResponse } from '@/types';

function BookingContent() {
  const [availableThemes, setAvailableThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setCurrentPrice] = useState(0);

  // Fetch available themes
  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      const result: APIResponse<Theme[]> = await response.json();

      if (result.success && result.data) {
        // Parse JSON strings for images if needed
        const themes = result.data.map(theme => ({
          ...theme,
          images: typeof theme.images === 'string' ? JSON.parse(theme.images) : theme.images
        }));
        setAvailableThemes(themes);
      } else {
        throw new Error('Failed to fetch themes');
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
      // Fallback to empty array if API fails
      setAvailableThemes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingSubmit = async (bookingData: BookingData) => {
    console.log('🚀 Submitting booking data:', bookingData);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('📡 Response status:', response.status);
      const result: APIResponse<Record<string, unknown>> = await response.json();
      console.log('📦 Parsed response result:', result);

      if (result.success) {
        console.log('✅ Booking created successfully:', result.data);
        // The BookingForm will handle the confirmation display
      } else {
        console.error('❌ Booking API return success=false:', result.error);
        throw new Error(result.error?.message || 'Booking failed');
      }
    } catch (error) {
      console.error('💥 Booking submission error in page.tsx:', error);
      throw error; // Re-throw to let BookingForm handle the error
    }
  };

  const handlePriceUpdate = useCallback((price: number) => {
    setCurrentPrice(price);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              Complete Your Booking
            </h1>
            <p className="text-lg text-gray-600">
              Let&apos;s make your celebration unforgettable!
            </p>
          </div>

          {/* Multi-step Booking Form */}
          <BookingForm
            onSubmit={handleBookingSubmit}
            onPriceUpdate={handlePriceUpdate}
            availableThemes={availableThemes}
          />
        </div>
      </div>
    </Layout>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking form...</p>
          </div>
        </div>
      </Layout>
    }>
      <BookingContent />
    </Suspense>
  );
}