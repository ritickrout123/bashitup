import { createPaymentIntent, verifyPaymentIntent, isStripeConfigured } from '@/lib/stripe';

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
      const paymentIntent = await createPaymentIntent(data.amount, data.bookingId);
      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      return {
        success: false,
        error: 'Failed to create payment intent',
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
      const paymentIntent = await verifyPaymentIntent(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return {
          success: false,
          error: 'Payment not completed',
        };
      }

      return {
        success: true,
        paymentStatus: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert from cents
        bookingId,
      };
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: 'Failed to confirm payment',
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