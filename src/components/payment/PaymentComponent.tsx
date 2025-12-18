'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface PaymentFormProps {
  amount: number;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  bookingId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount,
            bookingId,
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError('Failed to initialize payment');
        }
      } catch (error) {
        console.error('Payment intent creation error:', error);
        onError('Failed to initialize payment');
      }
    };

    createPaymentIntent();
  }, [amount, bookingId, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        const token = localStorage.getItem('token');
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            bookingId,
          }),
        });

        const data = await response.json();
        if (data.success) {
          onSuccess(paymentIntent.id);
        } else {
          onError('Payment confirmation failed');
        }
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Payment
        </h3>
        <p className="text-gray-600">
          Secure payment for your event decoration
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Amount to pay:</span>
            <span className="text-2xl font-bold text-purple-600">
              ₹{amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={cardElementOptions} />
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing || !clientSecret}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              `Pay ₹${amount.toLocaleString()}`
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </motion.div>
  );
};

interface PaymentComponentProps {
  amount: number;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentComponent;