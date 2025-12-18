import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, bookingId } = await request.json();

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json(
        { error: 'Payment intent ID and booking ID are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await AuthService.verifyAccessToken(token);

    // Verify payment with Stripe
    const paymentIntent = await verifyPaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Update booking with payment information
    const updatedBooking = await prisma.booking.update({
      where: {
        id: bookingId,
        customerId: decoded.userId,
      },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        paymentIntentId: paymentIntentId,
        paidAmount: paymentIntent.amount / 100, // Convert from cents
      },
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      paymentStatus: paymentIntent.status,
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}