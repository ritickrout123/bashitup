'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PaymentComponent from './PaymentComponent';
import CallbackScheduler from './CallbackScheduler';
import { PaymentService } from '@/services/paymentService';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    totalAmount: number;
    customerPhone: string;
    customerName: string;
  };
  onPaymentSuccess: (paymentId: string) => void;
  onCallbackScheduled: (message: string) => void;
}

type PaymentMode = 'selection' | 'payment' | 'callback';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onPaymentSuccess,
  onCallbackScheduled,
}) => {
  const [currentMode, setCurrentMode] = useState<PaymentMode>('selection');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handlePaymentSuccess = (paymentId: string) => {
    setSuccess('Payment successful! Your booking is confirmed.');
    setTimeout(() => {
      onPaymentSuccess(paymentId);
      onClose();
    }, 2000);
  };

  const handleCallbackSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      onCallbackScheduled(message);
      onClose();
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  const handleBack = () => {
    setCurrentMode('selection');
    setError('');
    setSuccess('');
  };

  const tokenAmount = PaymentService.calculateTokenAmount(bookingData.totalAmount);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentMode === 'selection' && 'Choose Payment Option'}
              {currentMode === 'payment' && 'Secure Payment'}
              {currentMode === 'callback' && 'Schedule Callback'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-800">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800">{success}</p>
                </div>
              </motion.div>
            )}

            {/* Payment Option Selection */}
            {currentMode === 'selection' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span>{bookingData.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">₹{bookingData.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token Amount (20%):</span>
                      <span className="font-medium text-purple-600">₹{tokenAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentMode('payment')}
                    className="w-full p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-700">
                          Pay Token Amount Now
                        </h4>
                        <p className="text-sm text-gray-600">
                          Pay ₹{tokenAmount.toLocaleString()} to confirm your booking instantly
                        </p>
                      </div>
                      <div className="text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentMode('callback')}
                    className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                          Schedule a Callback
                        </h4>
                        <p className="text-sm text-gray-600">
                          Our team will call you to discuss payment options
                        </p>
                      </div>
                      <div className="text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Important Note</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        A token payment secures your booking and preferred date. 
                        The remaining amount can be paid on the day of the event.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Payment Component */}
            {currentMode === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to options
                  </button>
                </div>
                <PaymentComponent
                  amount={tokenAmount}
                  bookingId={bookingData.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handleError}
                  onCancel={handleBack}
                />
              </motion.div>
            )}

            {/* Callback Scheduler */}
            {currentMode === 'callback' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4">
                  <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to options
                  </button>
                </div>
                <CallbackScheduler
                  bookingId={bookingData.id}
                  customerPhone={bookingData.customerPhone}
                  onSuccess={handleCallbackSuccess}
                  onError={handleError}
                  onCancel={handleBack}
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;