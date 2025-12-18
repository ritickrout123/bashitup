'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CallbackSchedulerProps {
  bookingId: string;
  customerPhone: string;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const CallbackScheduler: React.FC<CallbackSchedulerProps> = ({
  bookingId,
  customerPhone,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: customerPhone,
    preferredCallTime: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          preferredCallTime: formData.preferredCallTime,
          phoneNumber: formData.phoneNumber,
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess(data.message);
      } else {
        onError(data.error || 'Failed to schedule callback');
      }
    } catch (error) {
      console.error('Callback scheduling error:', error);
      onError('Failed to schedule callback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate time slots for the next 3 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 3; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      const dayName = day === 0 ? 'Today' : 
                     day === 1 ? 'Tomorrow' : 
                     date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Morning slots (9 AM - 12 PM)
      for (let hour = 9; hour <= 11; hour++) {
        const time = new Date(date);
        time.setHours(hour, 0, 0, 0);
        slots.push({
          value: time.toISOString(),
          label: `${dayName} - ${hour}:00 AM`,
        });
      }
      
      // Afternoon slots (2 PM - 6 PM)
      for (let hour = 14; hour <= 17; hour++) {
        const time = new Date(date);
        time.setHours(hour, 0, 0, 0);
        const displayHour = hour > 12 ? hour - 12 : hour;
        slots.push({
          value: time.toISOString(),
          label: `${dayName} - ${displayHour}:00 PM`,
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Schedule a Callback
        </h3>
        <p className="text-gray-600">
          Our team will call you to discuss payment options and finalize your booking
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="+91 98765 43210"
          />
        </div>

        <div>
          <label htmlFor="preferredCallTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Call Time
          </label>
          <select
            id="preferredCallTime"
            name="preferredCallTime"
            value={formData.preferredCallTime}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Select a time slot</option>
            {timeSlots.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Any specific requirements or questions..."
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">What happens next?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Our team will call you at your preferred time to discuss payment options, 
                answer any questions, and confirm your booking details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Scheduling...
              </div>
            ) : (
              'Schedule Callback'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CallbackScheduler;