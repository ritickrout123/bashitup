// Client-side service should NOT import from @/lib/stripe
// import { createPaymentIntent, verifyPaymentIntent, isStripeConfigured } from '@/lib/stripe';

export interface PaymentIntentData {
  amount: number;
  bookingId: string;
  customerId: string;
}

export interface CallbackData {
  bookingId: string;
  phoneNumber: string;
  preferredCallTime?: string;
  notes?: string;
}

const isStripeConfigured = () => {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

export class PaymentService {
  static async createPaymentIntent(data: PaymentIntentData) {
    if (!isStripeConfigured()) {
      return {
        success: false,
        error: 'Payment system not configured. Please contact support or use callback option.',
        requiresCallback: true,
      };
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: data.amount,
          bookingId: data.bookingId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      return {
        success: true,
        clientSecret: result.clientSecret,
        paymentIntentId: result.paymentIntentId,
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  static async confirmPayment(paymentIntentId: string, bookingId: string) {
    if (!isStripeConfigured()) {
      return {
        success: false,
        error: 'Payment system not configured',
      };
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId,
          bookingId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm payment');
      }

      return {
        success: true,
        paymentStatus: result.paymentStatus,
        amount: result.booking.paidAmount,
        bookingId,
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to confirm payment',
      };
    }
  }

  static async scheduleCallback(data: CallbackData) {
    try {
      // Here you would typically integrate with a CRM or notification system
      console.log('Scheduling callback for booking:', data.bookingId);

      return {
        success: true,
        message: 'Callback scheduled successfully. Our team will contact you soon.',
      };
    } catch (error) {
      console.error('Callback scheduling failed:', error);
      return {
        success: false,
        error: 'Failed to schedule callback',
      };
    }
  }

  static calculateTokenAmount(totalAmount: number): number {
    // Calculate 20% token amount with minimum of ₹500 and maximum of ₹2000
    const tokenPercentage = 0.2;
    const minToken = 500;
    const maxToken = 2000;

    const calculatedToken = Math.round(totalAmount * tokenPercentage);
    return Math.max(minToken, Math.min(maxToken, calculatedToken));
  }

  static formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}