'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TimeSlot, Location } from '@/types';
import { Loader } from '@/components/ui/Loader';
import { showErrorToast } from '@/lib/toast';

interface AvailabilityCheckerProps {
  selectedDate: Date | null;
  selectedTimeSlot: TimeSlot | null;
  location: Location;
  onDateChange: (date: Date) => void;
  onTimeSlotChange: (timeSlot: TimeSlot) => void;
  onAvailableSlotsChange: (slots: TimeSlot[]) => void;
}

// Default time slots (would be fetched from API in real implementation)
const defaultTimeSlots: TimeSlot[] = [
  { startTime: '09:00', endTime: '13:00', isAvailable: true },
  { startTime: '10:00', endTime: '14:00', isAvailable: true },
  { startTime: '11:00', endTime: '15:00', isAvailable: true },
  { startTime: '12:00', endTime: '16:00', isAvailable: true },
  { startTime: '13:00', endTime: '17:00', isAvailable: true },
  { startTime: '14:00', endTime: '18:00', isAvailable: true },
  { startTime: '15:00', endTime: '19:00', isAvailable: true },
  { startTime: '16:00', endTime: '20:00', isAvailable: true },
  { startTime: '17:00', endTime: '21:00', isAvailable: true },
  { startTime: '18:00', endTime: '22:00', isAvailable: true }
];

export function AvailabilityChecker({
  selectedDate,
  selectedTimeSlot,
  location,
  onDateChange,
  onTimeSlotChange,
  onAvailableSlotsChange
}: AvailabilityCheckerProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  // Get maximum date (3 months from now)
  const maxDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  const checkAvailability = useCallback(async (date: Date, loc: Location) => {
    console.log('🔍 Checking availability for:', date.toISOString().split('T')[0], loc.city, loc.pincode);
    setIsLoading(true);
    setError(null);

    try {
      // Use BookingService to check real availability
      const { BookingService } = await import('@/services/bookingService');
      const availabilityData = await BookingService.checkAvailability(
        date,
        loc.city,
        loc.pincode
      );

      // If API returns no slots (or empty), fallback to default slots to ensure availability
      if (!availabilityData.slots || availabilityData.slots.length === 0) {
        setAvailableSlots(defaultTimeSlots);
        onAvailableSlotsChange(defaultTimeSlots);
      } else {
        setAvailableSlots(availabilityData.slots);
        onAvailableSlotsChange(availabilityData.slots);
      }

      // If selected slot is no longer available, clear it
      if (selectedTimeSlot && !availabilityData.slots.find(s =>
        s.startTime === selectedTimeSlot.startTime && s.isAvailable
      )) {
        onTimeSlotChange(null as unknown as TimeSlot);
      }

    } catch (err) {
      const message = 'Failed to check availability. Please try again.';
      setError(message);
      showErrorToast(message);
      console.error('Availability check error:', err);

      // Fallback to default slots if API fails
      setAvailableSlots(defaultTimeSlots);
      onAvailableSlotsChange(defaultTimeSlots);
    } finally {
      setIsLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  // Check availability when date or location changes
  useEffect(() => {
    if (selectedDate) {
      // Add a small delay to debounce rapid changes
      const timeoutId = setTimeout(() => {
        checkAvailability(selectedDate, location);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate, location.city, location.pincode, checkAvailability]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      onDateChange(date);
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      onTimeSlotChange(slot);
    }
  };

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${slot.startTime} - ${slot.endTime}`;
  };

  const getTimeSlotLabel = (slot: TimeSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    if (startHour < 12) return 'Morning';
    if (startHour < 17) return 'Afternoon';
    return 'Evening';
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date *
        </label>
        <input
          type="date"
          min={minDate}
          max={maxDate}
          value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
          onChange={handleDateChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Available dates: Today to {new Date(maxDate).toLocaleDateString()}
        </p>
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Time Slot *
          </label>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size="lg" color="primary" />
              <span className="ml-3 text-gray-600 font-medium">Checking availability...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => checkAvailability(selectedDate, location)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {availableSlots.map((slot, index) => (
                <motion.button
                  key={`${slot.startTime}-${slot.endTime}`}
                  type="button"
                  onClick={() => handleTimeSlotSelect(slot)}
                  disabled={!slot.isAvailable}
                  className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${selectedTimeSlot?.startTime === slot.startTime
                    ? 'border-pink-500 bg-pink-50 shadow-lg'
                    : slot.isAvailable
                      ? 'border-gray-200 hover:border-pink-300 hover:shadow-md'
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                  whileHover={slot.isAvailable ? { scale: 1.02 } : {}}
                  whileTap={slot.isAvailable ? { scale: 0.98 } : {}}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-gray-800">
                      {formatTimeSlot(slot)}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${slot.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {slot.isAvailable ? 'Available' : 'Booked'}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {getTimeSlotLabel(slot)} • 4 hours setup
                  </div>
                  {!slot.isAvailable && (
                    <div className="text-xs text-red-600 mt-1">
                      This slot is already booked
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          )}

          {availableSlots.length === 0 && !isLoading && !error && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">😔</div>
              <p className="text-gray-600">No slots available for this date.</p>
              <p className="text-sm text-gray-500">Please try a different date.</p>
            </div>
          )}

          {availableSlots.length > 0 && !availableSlots.some(s => s.isAvailable) && (
            <div className="text-center py-4">
              <p className="text-orange-600 mb-2">All slots are booked for this date.</p>
              <p className="text-sm text-gray-500">Please select a different date or contact us for custom timing.</p>
            </div>
          )}
        </div>
      )}

      {/* Availability Info */}
      {selectedDate && availableSlots.length > 0 && (
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start">
            <div className="text-blue-500 mr-3 mt-0.5">ℹ️</div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-1">Availability Information</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Setup time: Few Minutes guaranteed</li>
                <li>• Our team arrives 15 minutes before your selected time</li>
                <li>• Decoration remains for the full 4-hour duration</li>
                <li>• Cleanup is included in the service</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Emergency Booking Notice */}
      {selectedDate && (
        <motion.div
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start">
            <div className="text-yellow-500 mr-3 mt-0.5">⚡</div>
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">Need urgent booking?</h4>
              <p className="text-sm text-yellow-700">
                For same-day or next-day bookings, please call us directly at{' '}
                <a href="tel:+919876543210" className="font-semibold underline">
                  +91 98765 43210
                </a>{' '}
                for immediate assistance.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}