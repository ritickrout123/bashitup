'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Theme, Location } from '@/types';
import { formatPrice } from '@/lib/pricing';
import { PaymentModal } from '@/components/payment';

interface BookingConfirmationProps {
  formData: {
    occasionType: string;
    themeId: string;
    date: Date | null;
    timeSlot: { startTime: string; endTime: string } | null;
    location: Location;
    guestCount: number;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    specialRequests?: string;
  };
  selectedTheme?: Theme;
  totalPrice: number;
}

const occasionLabels: { [key: string]: string } = {
  'BIRTHDAY': 'Birthday Party',
  'ANNIVERSARY': 'Anniversary',
  'BABY_SHOWER': 'Baby Shower',
  'CORPORATE': 'Corporate Event',
  'OTHER': 'Other Celebration'
};

export function BookingConfirmation({
  formData,
  selectedTheme,
  totalPrice
}: BookingConfirmationProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  const handleCreateBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          occasionType: formData.occasionType,
          themeId: formData.themeId,
          date: formData.date,
          timeSlot: {
            startTime: formData.timeSlot?.startTime,
            endTime: formData.timeSlot?.endTime
          },
          location: formData.location,
          guestCount: formData.guestCount,
          totalAmount: totalPrice,
          customerInfo: formData.customerInfo,
          specialRequests: formData.specialRequests,
        }),
      });

      const data = await response.json();
      if (data.success) {
        if (data.data.checkoutUrl) {
          console.log('Redirecting to Stripe Checkout...', data.data.checkoutUrl);
          window.location.href = data.data.checkoutUrl;
          return;
        } else {
          console.error('Checkout URL missing in response', data);
          alert('Payment initialization failed: Stripe configuration issue.');
          return;
        }
      } else {
        throw new Error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handlePaymentSuccess = (paymentId: string) => {
    console.log('Payment successful:', paymentId);
    setIsConfirmed(true);
    setConfirmationMessage('Payment successful! Your booking is confirmed.');
    setShowPaymentModal(false);

    // Trigger confetti effect
    if (typeof window !== 'undefined') {
      console.log('🎉 Booking confirmed! Confetti effect would trigger here');
    }
  };

  const handleCallbackScheduled = (message: string) => {
    setIsConfirmed(true);
    setConfirmationMessage(message);
    setShowPaymentModal(false);
  };

  if (isConfirmed) {
    return (
      <motion.div
        className="text-center space-y-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Animation */}
        <motion.div
          className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="text-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            ✅
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            Booking Confirmed! 🎉
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            {confirmationMessage || 'Your celebration is all set! We can\'t wait to make it magical.'}
          </p>
        </motion.div>

        {/* Booking Details Summary */}
        <motion.div
          className="bg-green-50 border border-green-200 rounded-xl p-6 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold text-green-800 mb-4">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono font-semibold">BIN-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Event Date:</span>
              <span className="font-semibold">
                {formData.date?.toLocaleDateString()} at {formData.timeSlot?.startTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Theme:</span>
              <span className="font-semibold">{selectedTheme?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-green-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-semibold text-blue-800 mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-blue-800">WhatsApp Confirmation</p>
                <p className="text-sm text-blue-700">
                  You&apos;ll receive a WhatsApp message within 5 minutes with all details
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-blue-800">Team Assignment</p>
                <p className="text-sm text-blue-700">
                  Our decoration team will be assigned and will contact you 24 hours before
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-blue-800">Setup Day</p>
                <p className="text-sm text-blue-700">
                  Our team arrives 15 minutes early and completes setup in Few Minutes
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          className="bg-gray-50 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-semibold text-gray-800 mb-4">Need Help?</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              📞 Call Us: +91 98765 43210
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              💬 WhatsApp Support
            </a>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            View My Bookings
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Review Your Booking
        </h2>
        <p className="text-gray-600">
          Please review all details before confirming your booking
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Details</h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Event Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Event Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Occasion:</span>
                <span className="font-semibold">{occasionLabels[formData.occasionType]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Theme:</span>
                <span className="font-semibold">{selectedTheme?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-semibold">
                  {formData.date?.toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-semibold">
                  {formData.timeSlot?.startTime} - {formData.timeSlot?.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold">{formData.guestCount} people</span>
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Location & Contact</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 block">Venue:</span>
                <span className="font-semibold">
                  {formData.location.address}, {formData.location.city} - {formData.location.pincode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{formData.customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{formData.customerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold">{formData.customerInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requests */}
        {formData.specialRequests && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2">Special Requests</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {formData.specialRequests}
            </p>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Amount</h3>
          <div className="text-3xl font-bold text-pink-600 mb-2">
            {formatPrice(totalPrice)}
          </div>
          <p className="text-sm text-gray-600">Including all taxes and charges</p>
        </div>
      </div>



      {/* Terms and Conditions */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="text-pink-600 hover:underline">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy" className="text-pink-600 hover:underline">Privacy Policy</a>.
            I understand that a 60-minute setup guarantee applies and the decoration will remain for 4 hours.
          </label>
        </div>
      </div>

      {/* Confirmation Buttons */}
      <div className="flex gap-4 justify-center">
        <motion.button
          onClick={handleCreateBooking}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Proceed to Payment
        </motion.button>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && bookingId && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          bookingData={{
            id: bookingId,
            totalAmount: totalPrice,
            customerPhone: formData.customerInfo.phone,
            customerName: formData.customerInfo.name,
          }}
          onPaymentSuccess={handlePaymentSuccess}
          onCallbackScheduled={handleCallbackScheduled}
        />
      )}
    </div>
  );
}