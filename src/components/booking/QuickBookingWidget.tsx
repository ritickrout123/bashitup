'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QuickBookingData, EventCategory } from '@/types';
import { calculateEstimatedPrice, budgetRanges, isLocationServiceable } from '@/lib/pricing';
import { validateQuickBooking } from '@/lib/validation';

interface QuickBookingWidgetProps {
  onSubmit?: (data: QuickBookingData) => void;
  loading?: boolean;
  className?: string;
}

const occasionTypes: { label: string; value: EventCategory }[] = [
  { label: 'Birthday Party', value: 'BIRTHDAY' },
  { label: 'Anniversary', value: 'ANNIVERSARY' },
  { label: 'Baby Shower', value: 'BABY_SHOWER' },
  { label: 'Corporate Event', value: 'CORPORATE' },
  { label: 'Other', value: 'OTHER' }
];

const tricityCities = [
  'Chandigarh',
  'Mohali',
  'Panchkula'
];

export function QuickBookingWidget({
  onSubmit,
  loading = false,
  className = ''
}: QuickBookingWidgetProps) {
  const [formData, setFormData] = useState<QuickBookingData>({
    date: '',
    occasion: '',
    location: '',
    budgetRange: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Handle form field changes
  const handleChange = (field: keyof QuickBookingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Calculate estimated price based on selections
  useEffect(() => {
    if (formData.occasion && formData.budgetRange) {
      try {
        const estimated = calculateEstimatedPrice({
          occasion: formData.occasion as EventCategory,
          budgetRange: formData.budgetRange,
          location: formData.location,
          guestCount: 25 // Default guest count for estimation
        });
        setEstimatedPrice(estimated);
      } catch (error) {
        console.error('Error calculating price:', error);
        setEstimatedPrice(null);
      }
    } else {
      setEstimatedPrice(null);
    }
  }, [formData.occasion, formData.budgetRange, formData.location]);

  // Validate form
  const validateForm = (): boolean => {
    const validation = validateQuickBooking(formData);

    // Convert validation errors to error object
    const newErrors: { [key: string]: string } = {};
    validation.errors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    // Add location serviceability check
    if (formData.location && !isLocationServiceable(formData.location)) {
      newErrors.location = 'We don\'t service this location yet. Please contact us for availability.';
    }

    setErrors(newErrors);
    return validation.isValid && Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // Track form submission
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'quick_booking_submit', {
          event_category: 'Booking',
          event_label: formData.occasion,
          value: estimatedPrice || 0
        });
      }

      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Default behavior - redirect to full booking page
        const params = new URLSearchParams({
          date: formData.date,
          occasion: formData.occasion,
          location: formData.location,
          budget: formData.budgetRange
        });
        window.location.href = `/booking?${params.toString()}`;
      }
    }
  };



  return (
    <motion.section
      id="quick-booking"
      className={`relative px-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto">
        <motion.div
          className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-2xl"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.h2
            className="mb-6 text-center text-2xl font-bold text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Quick Booking
          </motion.h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Date Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Event Date *
                </label>
                <input
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.date
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-pink-500'
                    }`}
                />
                {errors.date && (
                  <motion.p
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.date}
                  </motion.p>
                )}
              </motion.div>

              {/* Occasion Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Occasion *
                </label>
                <select
                  value={formData.occasion}
                  onChange={(e) => handleChange('occasion', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.occasion
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-pink-500'
                    }`}
                >
                  <option value="">Select Occasion</option>
                  {occasionTypes.map((occasion) => (
                    <option key={occasion.value} value={occasion.value}>
                      {occasion.label}
                    </option>
                  ))}
                </select>
                {errors.occasion && (
                  <motion.p
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.occasion}
                  </motion.p>
                )}
              </motion.div>

              {/* Location Field */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.location
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-pink-500'
                    }`}
                >
                  <option value="">Select City</option>
                  {tricityCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {errors.location && (
                  <motion.p
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.location}
                  </motion.p>
                )}
              </motion.div>

              {/* Budget Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Budget Range *
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => handleChange('budgetRange', e.target.value)}
                  className={`w-full rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${errors.budgetRange
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 focus:border-pink-500'
                    }`}
                >
                  <option value="">Select Budget</option>
                  {budgetRanges.map((budget) => (
                    <option key={budget.value} value={budget.value}>
                      {budget.label}
                    </option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <motion.p
                    className="mt-1 text-sm text-red-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {errors.budgetRange}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Price Estimation */}
            {estimatedPrice && (
              <motion.div
                className="rounded-lg bg-gradient-to-r from-pink-50 to-purple-50 p-4 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-sm text-gray-600">Estimated Starting Price</p>
                <p className="text-2xl font-bold text-pink-600">
                  ₹{estimatedPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  *Final price may vary based on specific requirements
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {loading ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Get Quote Now
                    <motion.svg
                      className="ml-2 h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </motion.svg>
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>

          {/* Additional Info */}
          <motion.div
            className="mt-6 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p>
              🚀 <strong>60-minute setup guarantee</strong> •
              📞 <strong>Free consultation</strong> •
              💯 <strong>100% satisfaction</strong>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}