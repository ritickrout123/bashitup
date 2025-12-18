import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { amount, bookingId } = await request.json();

    if (!amount || !bookingId) {
      return NextResponse.json(
        { error: 'Amount and booking ID are required' },
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

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        customerId: decoded.userId,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent(amount, bookingId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}