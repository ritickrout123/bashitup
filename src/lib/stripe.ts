import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Check if Stripe keys are available
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Client-side Stripe instance
export const getStripe = () => {
  if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('your_stripe')) {
    console.warn('Stripe publishable key not configured');
    return null;
  }
  return loadStripe(STRIPE_PUBLISHABLE_KEY);
};

// Server-side Stripe instance
export const stripe = STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes('your_stripe')
  ? new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  })
  : null;

// Payment intent creation
export async function createPaymentIntent(amount: number, bookingId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured. Please add your Stripe API keys to continue with payments.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        bookingId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Verify payment intent
export async function verifyPaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe not configured. Please add your Stripe API keys to continue with payments.');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error verifying payment intent:', error);
    throw new Error('Failed to verify payment');
  }
}

// Create setup intent for future payments
export async function createSetupIntent(customerId?: string) {
  if (!stripe) {
    throw new Error('Stripe not configured. Please add your Stripe API keys to continue with payments.');
  }

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });

    return setupIntent;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error('Failed to create setup intent');
  }
}

// Helper function to check if Stripe is configured
export function isStripeConfigured(): boolean {
  return stripe !== null && STRIPE_PUBLISHABLE_KEY !== undefined && !STRIPE_PUBLISHABLE_KEY.includes('your_stripe');
}